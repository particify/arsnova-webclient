import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { TranslocoService } from '@ngneat/transloco';
import { Message } from '@stomp/stompjs';
import { Observable, takeUntil } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';

@Component({
  selector: 'app-comments-page',
  templateUrl: './comments-page.component.html',
  styleUrls: ['./comments-page.component.scss'],
})
export class CommentsPageComponent
  extends AbstractCommentsPageComponent
  implements OnInit, OnDestroy
{
  private moderationComments$?: Observable<Comment[]>;

  isModeration = false;
  moderationCounter = 0;

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
    protected routingService: RoutingService
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
    this.isModeration = route.snapshot.data.isModeration;
  }

  ngOnInit(): void {
    this.publicComments$ = this.commentService.getAckComments(this.room.id);
    this.moderationComments$ = this.commentService.getRejectedComments(
      this.room.id
    );
    this.activeComments$ = this.isModeration
      ? this.moderationComments$
      : this.publicComments$;
    this.load();
    if (innerWidth > 1000) {
      this.scrollMax += innerWidth * 0.04 + 240;
      this.scrollStart = this.scrollMax;
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  getModerationCounter() {
    this.commentService
      .countByRoomId(this.room.id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.moderationCounter = commentCounter;
      });
  }

  getPublicCounter() {
    this.commentService
      .countByRoomId(this.room.id, true)
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
      .getModeratorCommentStream(this.roomId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((message: Message) => {
        this.parseIncomingModeratorMessage(message);
      });
  }

  parseIncomingModeratorMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    if (msg.type === 'CommentCreated') {
      if (this.isModeration) {
        this.addNewComment(payload);
      }
      this.moderationCounter++;
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

  handleCommentDelete(id: string) {
    this.removeCommentFromList(id);
    if (this.isModeration) {
      this.moderationCounter--;
    } else {
      this.publicCounter--;
      this.reduceCommentCounter();
      this.checkIfActiveComment(id);
    }
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

  resetComments() {
    this.comments = [];
    this.setTimePeriod(this.period);
  }

  updateUrl() {
    const role = this.routingService.getRoleRoute(this.viewRole);
    const url = [role, this.room.shortId, 'comments'];
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
