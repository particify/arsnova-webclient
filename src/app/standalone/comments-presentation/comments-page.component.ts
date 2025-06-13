import { Location } from '@angular/common';
import {
  booleanAttribute,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { EventService } from '@app/core/services/util/event.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { provideTranslocoScope } from '@jsverse/transloco';
import { take, takeUntil } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { PresentCommentComponent } from '@app/standalone/present-comment/present-comment.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-comments-presentation',
  templateUrl: './comments-page.component.html',
  styleUrls: ['./comments-page.component.scss'],
  imports: [
    CoreModule,
    PresentCommentComponent,
    LoadingIndicatorComponent,
    CommentSettingsHintComponent,
    CommentListHintComponent,
    CommentComponent,
  ],
  providers: [provideTranslocoScope('creator')],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit, OnDestroy
{
  protected hotkeyService = inject(HotkeyService);
  protected location = inject(Location);
  protected routingService = inject(RoutingService);
  protected eventService = inject(EventService);
  private presentationService = inject(PresentationService);
  protected focusModeService = inject(FocusModeService);
  private formService = inject(FormService);

  @ViewChild('commentList') commentListRef!: ElementRef;

  // Route data input below
  @Input({ transform: booleanAttribute }) outlinedCards!: boolean;

  protected hotkeyRefs: symbol[] = [];

  ngOnInit(): void {
    this.publicComments$ = this.commentService.getAckComments(this.room().id);
    this.activeComments$ = this.publicComments$;
    this.load();
    this.registerHotkeys();
  }

  ngOnDestroy(): void {
    this.destroy();
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  subscribeToPresentationEvents() {
    if (!this.activeComment) {
      this.goToFirstComment();
    }

    this.presentationService
      .getCommentSortChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sort) => {
        this.sortComments(sort as CommentSort);
        this.goToFirstComment();
      });
    this.presentationService
      .getCommentFilterChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((filter) => {
        this.filterComments(filter);
        this.goToFirstComment();
      });
    this.presentationService
      .getCommentPeriodChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((period) => {
        this.setTimePeriod(period);
        this.goToFirstComment();
      });
    this.presentationService
      .getCommentCategoryChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((category) => {
        this.selectTag(category);
        this.goToFirstComment();
      });
  }

  goToFirstComment() {
    if (this.displayComments.length > 0) {
      setTimeout(() => {
        this.updateCurrentComment(this.displayComments[0]);
      }, 300);
    } else {
      if (this.activeComment?.highlighted) {
        this.commentService.lowlight(this.activeComment).subscribe();
      }
      this.activeComment = undefined;
    }
  }

  afterCommentsLoadedHook(): void {
    if (this.comments.length === 0) {
      this.focusModeService.updateCommentState('NO_COMMENTS_YET');
    }
    this.subscribeToPresentationEvents();
  }

  registerHotkeys() {
    this.translateService
      .selectTranslate([
        'creator.comment-list.next',
        'creator.comment-list.previous',
      ])
      .pipe(take(1))
      .subscribe((t) => {
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowRight',
            action: () => this.nextComment(),
            actionTitle: t[0],
          },
          this.hotkeyRefs
        );
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowLeft',
            action: () => this.prevComment(),
            actionTitle: t[1],
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

    this.focusModeService.updateCommentState(comment.id);
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
    this.announceService.announce('creator.presentation.a11y-present-comment', {
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
      this.room().id,
      this.directSend,
      this.fileUploadEnabled,
      false,
      this.readonly
    );
    this.commentSettingsService
      .update(settings)
      .subscribe((updatedSettings) => {
        this.disabled = updatedSettings.disabled;
        this.formService.enableForm();
        this.isLoading = true;
        this.load(true);
        const msg = this.translateService.translate(
          'creator.comment-list.q-and-a-enabled'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
  }

  toggleReadonly() {
    const commentSettings = new CommentSettings(
      this.room().id,
      this.directSend,
      this.fileUploadEnabled,
      this.disabled,
      !this.readonly
    );
    this.commentSettingsService.update(commentSettings).subscribe(() => {
      this.readonly = !this.readonly;
      this.formService.enableForm();
      this.showReadonlyStateNotification();
    });
  }
}
