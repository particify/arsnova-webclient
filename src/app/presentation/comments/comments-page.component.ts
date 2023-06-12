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
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { PresentationEvent } from '@app/core/models/events/presentation-events.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { EventService } from '@app/core/services/util/event.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RemoteService } from '@app/core/services/util/remote.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { TranslateService } from '@ngx-translate/core';

export class CommentPresentationState {
  stepState: string;
  commentId: string;

  constructor(step: string, commentId: string) {
    this.stepState = step;
    this.commentId = commentId;
  }
}

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
    protected remoteService: RemoteService
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
      this.initPublicCounter();
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
    this.eventService
      .on<string>(PresentationEvent.COMMENT_SORTING_UPDATED)
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
      this.remoteService.updateCommentStateChange('NO_COMMENTS_YET');
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

  getCurrentIndex(): number {
    return this.getIndexOfComment(this.activeComment);
  }

  getStepState(index) {
    let state;
    if (index === 0) {
      state = 'START';
    } else if (index === this.comments.length - 1) {
      state = 'END';
    }
    return state;
  }

  updateCurrentComment(comment: Comment, idChanged = false) {
    if (!idChanged) {
      if (comment.highlighted) {
        this.commentService.lowlight(comment).subscribe();
      } else {
        const highlightedComment = this.comments.filter(
          (c) => c.highlighted
        )[0];
        if (highlightedComment) {
          this.commentService.lowlight(highlightedComment).subscribe();
        }
        this.commentService.highlight(comment).subscribe();
      }
    }
    if (this.activeComment?.highlighted) {
      this.commentService.lowlight(this.activeComment).subscribe();
    }
    this.activeComment = comment;
    const index = this.getIndexOfComment(comment);
    const commentPresentationState = new CommentPresentationState(
      this.getStepState(index),
      comment.id
    );
    this.eventService.broadcast(
      PresentationEvent.COMMENT_STATE_UPDATED,
      commentPresentationState
    );
    this.remoteService.updateCommentStateChange(comment.id);
    if (!this.isLoading) {
      this.scrollToComment(index);
      this.announceCommentPresentation(index);
    }
  }

  getCommentElements() {
    return document.getElementsByName('comment');
  }

  scrollToComment(index) {
    this.getCommentElements()[index].scrollIntoView({
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
    if (index < this.displayComments.length - 1) {
      const nextComment = this.displayComments[index + 1];
      this.updateCurrentComment(nextComment);
    }
  }

  prevComment() {
    const index = this.getCurrentIndex();
    if (index > 0) {
      const prevComment = this.displayComments[index - 1];
      this.updateCurrentComment(prevComment);
    }
  }
}
