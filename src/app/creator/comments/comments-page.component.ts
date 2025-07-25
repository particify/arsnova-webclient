import { Location, AsyncPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  AbstractCommentsPageComponent,
  BAR_PADDING,
} from '@app/common/abstract/abstract-comments-page.component';
import { Message } from '@stomp/stompjs';
import { Observable, takeUntil } from 'rxjs';
import { FormService } from '@app/core/services/util/form.service';
import { FlexModule } from '@angular/flex-layout';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { CommentListBarExtensionComponent } from './comment-list-bar-extension/comment-list-bar-extension.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CounterBracesPipe } from '@app/core/pipes/counter-braces.pipe';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

const TAB_GROUP_HEIGHT = 48;

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['../../common/styles/comments-page.scss'],
  imports: [
    FlexModule,
    MatTabGroup,
    AutofocusDirective,
    MatTab,
    CommentListBarComponent,
    CommentListBarExtensionComponent,
    LoadingIndicatorComponent,
    CommentSettingsHintComponent,
    CommentListHintComponent,
    CommentComponent,
    CommentListAddButtonComponent,
    CommentListFloatingButtonsComponent,
    AsyncPipe,
    CounterBracesPipe,
    A11yIntroPipe,
    TranslocoPipe,
  ],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit, OnDestroy
{
  protected location = inject(Location);
  protected routingService = inject(RoutingService);
  private formService = inject(FormService);

  // Route data input below
  @Input({ required: true }) isModeration!: boolean;

  private moderationComments$?: Observable<Comment[]>;

  moderationCounter = 0;

  ngOnInit(): void {
    this.publicComments$ = this.commentService.getAckComments(this.room().id);
    this.moderationComments$ = this.commentService.getRejectedComments(
      this.room().id
    );
    this.activeComments$ = this.isModeration
      ? this.moderationComments$
      : this.publicComments$;
    this.load();
    this.scrollStart += BAR_PADDING + TAB_GROUP_HEIGHT;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  getModerationCounter() {
    this.commentService
      .countByRoomId(this.room().id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.moderationCounter = commentCounter;
      });
  }

  getPublicCounter() {
    this.commentService
      .countByRoomId(this.room().id, true)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.publicCounter = commentCounter;
      });
  }

  subscribeToStreams() {
    this.subscribeCommentStream();
    this.subscribeModeratorStream();
  }

  subscribeModeratorStream() {
    this.wsCommentService
      .getModeratorCommentStream(this.room().id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message: Message) => {
        this.parseIncomingModeratorMessage(message);
      });
  }

  override addNewComment(comment: Comment): void {
    if (!this.isModeration) {
      super.addNewComment(comment);
    }
  }

  addNewModeratorComment(comment: Comment): void {
    if (this.isModeration) {
      super.addNewComment(comment);
    }
  }

  parseIncomingModeratorMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case 'CommentCreated':
        if (this.isModeration) {
          this.addNewModeratorComment(payload);
        }
        this.moderationCounter++;
        break;
      case 'CommentDeleted':
        this.handleModeratorCommentDelete(payload.id);
        break;
    }
    if (!this.freeze) {
      this.afterIncomingMessage();
    }
  }

  handleCommentPatchAck(id: string, value: boolean) {
    const isNowAck = this.isModeration ? !value : <boolean>value;
    if (!isNowAck) {
      this.removeCommentFromList(id);
      this.reduceCommentCounter();
      this.checkIfActiveComment(id);
      if (this.isModeration) {
        this.moderationCounter--;
      } else {
        this.publicCounter--;
      }
    } else {
      if (!this.isModeration) {
        this.moderationCounter--;
      }
    }
  }

  handleModeratorCommentDelete(id: string) {
    this.removeCommentFromList(id);
    this.moderationCounter--;
    this.reduceCommentCounter();
    this.checkIfActiveComment(id);
  }

  pauseComments() {
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

  resetComments() {
    this.comments = [];
    this.setTimePeriod(this.period);
  }

  updateUrl() {
    const role = this.routingService.getRoleRoute(this.viewRole);
    const url = [role, this.room().shortId, 'comments'];
    if (this.isModeration) {
      url.push('moderation');
    }
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  switchList(index: number) {
    this.isLoading = true;
    if (index === 1) {
      this.isModeration = true;
      this.activeComments$ = this.moderationComments$;
    } else {
      this.isModeration = false;
      this.activeComments$ = this.publicComments$;
    }
    this.load(true);
    this.updateUrl();
  }

  activateComments() {
    const settings = new CommentSettings(
      this.room().id,
      this.directSend,
      this.fileUploadEnabled,
      false,
      false
    );
    this.commentSettingsService
      .update(settings)
      .subscribe((updatedSettings) => {
        this.disabled = updatedSettings.disabled;
        this.readonly = updatedSettings.readonly;
        this.formService.enableForm();
        this.isLoading = true;
        this.load(true);
        const msg = this.translateService.translate('comment-list.qna-started');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
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
  }

  afterCommentsLoadedHook(): void {
    const currentCommentCount = this.comments.length;
    if (this.isModeration) {
      this.getPublicCounter();
      this.moderationCounter = currentCommentCount;
    } else {
      this.getModerationCounter();
      this.publicCounter = currentCommentCount;
    }
  }
}
