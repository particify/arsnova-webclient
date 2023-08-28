import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['./comments-page.component.scss'],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit, OnDestroy
{
  @ViewChild('commentList') commentListRef: ElementRef;

  protected hotkeyRefs: symbol[] = [];

  constructor(
    protected commentService: CommentService,
    protected translateService: TranslateService,
    protected dialog: MatDialog,
    protected wsCommentService: WsCommentService,
    protected notificationService: NotificationService,
    protected announceService: AnnounceService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected commentSettingsService: CommentSettingsService,
    protected hotkeyService: HotkeyService,
    protected authenticationService: AuthenticationService,
    protected location: Location,
    protected routingService: RoutingService,
    protected eventService: EventService,
    private presentationService: PresentationService,
    protected focusModeService: FocusModeService
  ) {
    super(
      commentService,
      translateService,
      dialog,
      wsCommentService,
      notificationService,
      announceService,
      router,
      route,
      globalStorageService,
      commentSettingsService,
      authenticationService
    );
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.room = data.room;
      this.roomId = this.room.id;
      this.viewRole = data.viewRole;
      this.publicComments$ = this.commentService.getAckComments(this.room.id);
      this.activeComments$ = this.publicComments$;
      this.init();
      this.registerHotkeys();
    });
  }

  ngOnDestroy(): void {
    this.destroy();
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  subscribeToPresentationEvents() {
    if (this.displayComments.length > 0) {
      setTimeout(() => {
        if (!this.activeComment) {
          this.goToFirstComment();
        }
      }, 300);
    }
    this.presentationService
      .getCommentSortChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sort) => {
        this.sortComments(sort as CommentSort);
        setTimeout(() => {
          this.goToFirstComment();
        }, 300);
      });
  }

  goToFirstComment() {
    this.updateCurrentComment(this.displayComments[0]);
  }

  afterCommentsLoadedHook(): void {
    if (this.comments.length === 0) {
      this.focusModeService.updateCommentState(this.room, 'NO_COMMENTS_YET');
    }
    this.subscribeToPresentationEvents();
  }

  registerHotkeys() {
    this.translateService
      .get(['comment-list.next', 'comment-list.previous'])
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowRight',
            action: () => this.nextComment(),
            actionTitle: t['comment-list.next'],
          },
          this.hotkeyRefs
        );
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowLeft',
            action: () => this.prevComment(),
            actionTitle: t['comment-list.previous'],
          },
          this.hotkeyRefs
        );
      });
  }

  onScroll() {
    this.checkScroll(this.commentListRef.nativeElement);
  }

  getIndexOfComment(comment: Comment): number {
    return Math.max(this.displayComments.indexOf(comment), 0);
  }

  getCurrentIndex(): number | undefined {
    if (this.activeComment) {
      return this.getIndexOfComment(this.activeComment);
    }
  }

  updateCurrentComment(comment: Comment, idChanged = false) {
    if (!idChanged) {
      if (comment.highlighted) {
        this.commentService.lowlight(comment).subscribe();
      } else {
        if (this.activeComment?.highlighted) {
          this.commentService.lowlight(this.activeComment).subscribe();
        }
        this.commentService.highlight(comment).subscribe();
      }
    }
    this.activeComment = comment;
    const index = this.getIndexOfComment(comment);
    const commentPresentationState = new CommentPresentationState(
      this.presentationService.getStepState(index, this.comments.length),
      comment.id
    );
    this.presentationService.updateCommentState(commentPresentationState);
    this.focusModeService.updateCommentState(this.room, comment.id);
    if (!this.isLoading) {
      this.scrollToComment(index);
      this.announceCommentPresentation(index);
    }
  }

  getCommentElements() {
    return document.getElementsByName('comment');
  }

  scrollToComment(index: number) {
    this.getCommentElements()[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  announceCommentPresentation(index: number) {
    this.announceService.announce('presentation.a11y-present-comment', {
      comment: this.displayComments[index].body,
    });
  }

  nextComment() {
    const index = this.getCurrentIndex();
    if (index !== undefined && index < this.displayComments.length - 1) {
      const nextComment = this.displayComments[index + 1];
      this.updateCurrentComment(nextComment);
    }
  }

  prevComment() {
    const index = this.getCurrentIndex();
    if (index !== undefined && index > 0) {
      const prevComment = this.displayComments[index - 1];
      this.updateCurrentComment(prevComment);
    }
  }

  activateComments() {
    const settings = new CommentSettings(
      this.roomId,
      this.directSend,
      this.fileUploadEnabled,
      false,
      this.readonly
    );
    this.commentSettingsService
      .update(settings)
      .subscribe((updatedSettings) => {
        this.disabled = updatedSettings.disabled;
        this.isLoading = true;
        this.init(true);
        const msg = this.translateService.instant(
          'comment-list.q-and-a-enabled'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
  }

  toggleReadonly() {
    const commentSettings = new CommentSettings(
      this.roomId,
      this.directSend,
      this.fileUploadEnabled,
      this.disabled,
      !this.readonly
    );
    this.commentSettingsService.update(commentSettings).subscribe(() => {
      this.readonly = !this.readonly;
      this.showReadonlyStateNotification();
    });
  }
}
