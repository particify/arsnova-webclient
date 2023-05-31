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
import { TranslateService } from '@ngx-translate/core';
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
  private moderationComments$: Observable<Comment[]>;
  private archivedComments$: Observable<Comment[]>;

  isArchive = false;
  isModeration = false;
  moderationCounter = 0;

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
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.room = data.room;
      this.roomId = this.room.id;
      this.viewRole = data.viewRole;
      if (this.isArchive) {
        this.activeComments$ = this.archivedComments$;
      } else {
        this.isModeration = data.isModeration;
        this.publicComments$ = this.commentService.getAckComments(this.room.id);
        this.moderationComments$ = this.commentService.getRejectedComments(
          this.room.id
        );
        this.activeComments$ = this.isModeration
          ? this.moderationComments$
          : this.publicComments$;
      }
      this.initPublicCounter();
      this.initModerationCounter();
      this.init();
      if (innerWidth > 1000) {
        this.scrollMax += innerWidth * 0.04 + 240;
        this.scrollStart = this.scrollMax;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initModerationCounter() {
    this.commentService
      .countByRoomId(this.room.id, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.moderationCounter = commentCounter;
      });
  }

  subscribeToStreams() {
    if (!this.isArchive) {
      this.subscribeCommentStream();
      this.subscribeModeratorStream();
    }
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
    this.init(true);
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
}
