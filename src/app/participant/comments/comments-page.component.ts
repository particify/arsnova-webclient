import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCommentsPageComponent } from '@app/common/abstract/abstract-comments-page.component';
import { Comment } from '@app/core/models/comment';
import { CommentSettings } from '@app/core/models/comment-settings';
import { Room } from '@app/core/models/room';
import { Vote } from '@app/core/models/vote';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { RoomService } from '@app/core/services/http/room.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { NotificationService } from '@app/core/services/util/notification.service';
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
  commentVoteMap = new Map<string, Vote>();

  room: Room;

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
    private voteService: VoteService,
    private roomService: RoomService
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
      this.publicComments$ = this.commentService
        .getAckComments(this.room.id)
        .pipe(takeUntil(this.destroyed$));
      this.activeComments$ = this.publicComments$;
      this.initPublicCounter();
      this.init();
    });
    this.roomService
      .getCurrentRoomStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((room) => (this.room = room));
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  afterCommentsLoadedHook() {
    this.voteService
      .getByRoomIdAndUserID(this.roomId, this.userId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((votes) => {
        for (const v of votes) {
          this.commentVoteMap.set(v.commentId, v);
        }
      });
    this.commentSettingsService
      .getSettingsStream()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.handleSettings(settings);
      });
  }

  getVote(comment: Comment): Vote {
    return this.commentVoteMap.get(comment.id);
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
}
