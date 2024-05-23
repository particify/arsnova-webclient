import { Location, NgIf, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { Vote } from '@app/core/models/vote';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { TranslocoService, TranslocoPipe } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { CoreModule } from '@app/core/core.module';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['../../common/styles/comments-page.scss'],
  standalone: true,
  imports: [
    FlexModule,
    NgIf,
    CommentListBarComponent,
    LoadingIndicatorComponent,
    CommentSettingsHintComponent,
    CommentListHintComponent,
    CoreModule,
    NgFor,
    CommentComponent,
    CommentListAddButtonComponent,
    CommentListFloatingButtonsComponent,
    TranslocoPipe,
  ],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit, OnDestroy
{
  commentVoteMap = new Map<string, Vote>();

  focusModeEnabled = false;

  constructor(
    protected commentService: CommentService,
    protected translateService: TranslocoService,
    protected dialog: MatDialog,
    protected wsCommentService: WsCommentService,
    protected notificationService: NotificationService,
    protected announceService: AnnounceService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected commentSettingsService: CommentSettingsService,
    protected authenticationService: AuthenticationService,
    protected location: Location,
    private voteService: VoteService,
    private focusModeService: FocusModeService
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
    this.publicComments$ = this.commentService
      .getAckComments(this.room.id)
      .pipe(takeUntil(this.destroyed$));
    this.activeComments$ = this.publicComments$;
    this.load();
    this.focusModeService
      .getFocusModeEnabled()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((focusModeEnabled) => {
        this.focusModeEnabled = focusModeEnabled;
      });
    this.focusModeService
      .getCommentState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => this.highlightFocusedComment(state.commentId));
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  afterCommentsLoadedHook() {
    if (this.userId) {
      this.voteService
        .getByRoomIdAndUserID(this.roomId, this.userId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((votes) => {
          for (const v of votes) {
            this.commentVoteMap.set(v.commentId, v);
          }
        });
    }
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.handleSettings(settings);
      });
  }

  getVote(comment: Comment): Vote {
    return this.commentVoteMap.get(comment.id) || new Vote();
  }

  handleSettings(settings: CommentSettings) {
    if (settings.disabled !== this.disabled) {
      this.disabled = settings.disabled;
    }
    if (settings.readonly !== this.readonly) {
      this.readonly = settings.readonly;
      this.showReadonlyStateNotification();
    }
  }

  highlightFocusedComment(commentId: string) {
    const comment = this.displayComments.find((c) => c.id === commentId);
    if (comment) {
      comment.highlighted = true;
    }
  }
}
