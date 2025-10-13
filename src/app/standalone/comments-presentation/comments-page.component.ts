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
  DestroyRef,
  effect,
} from '@angular/core';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { EventService } from '@app/core/services/util/event.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { provideTranslocoScope } from '@jsverse/transloco';
import { take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { PresentCommentComponent } from '@app/standalone/present-comment/present-comment.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { FormService } from '@app/core/services/util/form.service';
import {
  Post,
  StartQnaGql,
  UpdateQnaActivePostIdGql,
} from '@gql/generated/graphql';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private startQna = inject(StartQnaGql);
  private setActivePostId = inject(UpdateQnaActivePostIdGql);
  private destroyRef = inject(DestroyRef);

  @ViewChild('commentList') commentListRef!: ElementRef;

  // Route data input below
  @Input({ transform: booleanAttribute }) outlinedCards!: boolean;

  protected hotkeyRefs: symbol[] = [];

  constructor() {
    super();
    effect(() => {
      if (this.posts()) {
        this.initializeActivePost(this.posts(), this.activePost()?.id);
      }
    });
  }

  ngOnInit(): void {
    this.registerHotkeys();
    this.subscribeToPresentationEvents();
  }

  ngOnDestroy(): void {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  subscribeToPresentationEvents() {
    this.presentationService
      .getCommentSortChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sort) => {
        this.sort(sort);
      });
    this.presentationService
      .getCommentFilterChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filter) => {
        this.selectFlagFilter(filter);
      });
    this.presentationService
      .getCommentFilterRemoved()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filter) => {
        this.removeFlagFilter(filter);
      });
    this.presentationService
      .getCommentPeriodChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((period) => {
        this.setPeriod(period);
      });
    this.presentationService
      .getCommentCategoryChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((category) => {
        this.selectFilterTag(category);
      });
  }

  private initializeActivePost(posts: Post[], activePostId?: string) {
    if (
      posts.length > 0 &&
      (!activePostId || !posts.some((p) => p.id === activePostId))
    ) {
      this.updateCurrentComment(posts[0].id);
    } else {
      if (activePostId) {
        this.evaluateActivePost(
          activePostId,
          posts.map((p) => p.id).indexOf(activePostId)
        );
      }
    }
  }

  afterCommentsLoadedHook(): void {
    if (this.posts().length === 0) {
      this.focusModeService.updateCommentState('NO_COMMENTS_YET');
    }
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

  toggleActivePost(postId: string) {
    this.updateCurrentComment(
      this.activePost()?.id === postId ? undefined : postId
    );
  }

  updateCurrentComment(postId?: string) {
    const qnaId = this.qnaId();
    if (qnaId) {
      this.setActivePostId
        .mutate({
          variables: {
            id: qnaId,
            activePostId: postId,
          },
        })
        .subscribe({
          next: (r) => {
            this.evaluateActivePost(
              r.data?.updateQnaActivePostId.activePost?.id
            );
          },
        });
    }
  }

  private getPostIndex(postId: string) {
    return this.posts()
      .map((p) => p.id)
      .indexOf(postId);
  }

  private evaluateActivePost(postId?: string, index?: number) {
    if (!postId) {
      return;
    }
    if (!index) {
      index = this.getPostIndex(postId);
    }
    const commentPresentationState = new CommentPresentationState(
      this.presentationService.getStepState(index, this.posts().length),
      postId
    );
    this.presentationService.updateCommentState(commentPresentationState);
    this.focusModeService.updateCommentState(postId);
    setTimeout(() => {
      this.scrollToComment(index);
    });
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

  nextComment() {
    const activePostId = this.activePost()?.id;
    if (!activePostId) {
      return;
    }
    const index = this.getPostIndex(activePostId);
    if (index < this.posts().length - 1) {
      this.updateCurrentComment(this.posts()[index + 1].id);
    }
  }

  prevComment() {
    const activePostId = this.activePost()?.id;
    if (!activePostId) {
      return;
    }
    const index = this.getPostIndex(activePostId);
    if (index > 0) {
      this.updateCurrentComment(this.posts()[index - 1].id);
    }
  }

  enableComments() {
    const id = this.qnaId();
    if (id) {
      this.formService.disableForm();
      this.startQna
        .mutate({
          variables: { id: id },
        })
        .subscribe((r) => {
          if (r.data) {
            this.formService.enableForm();
            const msg = this.translateService.translate(
              'comment-list.qna-started'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        });
    }
  }
}
