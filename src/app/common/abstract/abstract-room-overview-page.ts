import { Subject, takeUntil } from 'rxjs';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomStats } from '@app/core/models/room-stats';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Message } from '@stomp/stompjs';
import { CommentService } from '@app/core/services/http/comment.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { EventService } from '@app/core/services/util/event.service';
import { Component, Input } from '@angular/core';
import { ApiConfig } from '@app/core/models/api-config';
import { RoutingService } from '@app/core/services/util/routing.service';

@Component({
  template: '',
  standalone: false,
})
export class AbstractRoomOverviewPageComponent {
  // Route data input below
  @Input({ required: true }) viewRole!: UserRole;
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) apiConfig!: ApiConfig;
  destroyed$ = new Subject<void>();

  isLoading = true;

  contentGroups: ContentGroup[] = [];
  roomStats?: RoomStats;
  commentCounter = 0;

  attachmentData?: object;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected commentService: CommentService,
    protected contentGroupService: ContentGroupService,
    protected wsCommentService: WsCommentService,
    protected eventService: EventService,
    protected routingService: RoutingService
  ) {}

  initializeStats(extendedStats: boolean) {
    this.roomStatsService
      .getStats(this.room.id, extendedStats)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((roomStats) => {
        this.roomStats = roomStats;
        if (this.roomStats && this.roomStats.groupStats?.length > 0) {
          this.initializeGroups();
        } else {
          this.contentGroups = [];
          this.isLoading = false;
          this.afterGroupsLoadHook();
        }
      });
  }

  initializeGroups() {
    if (!this.roomStats) {
      return;
    }
    this.contentGroups.splice(0, this.contentGroups.length);
    this.contentGroupService
      .getByIds(
        this.roomStats.groupStats.map((stats) => stats.id),
        { roomId: this.room.id }
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((groups) => {
        for (const group of groups) {
          this.contentGroups.push(group);
          if (this.contentGroups.length === this.roomStats?.groupStats.length) {
            this.contentGroups =
              this.contentGroupService.sortContentGroupsByName(
                this.contentGroups
              );
            this.afterGroupsLoadHook();
          }
        }
      });
  }

  afterGroupsLoadHook() {
    this.prepareAttachmentData();
    this.isLoading = false;
    this.setGroupDataInGlobalStorage();
  }

  setGroupDataInGlobalStorage() {
    // Implemented in extended class
  }

  subscribeCommentStream() {
    this.commentService
      .countByRoomId(this.room.id, true)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commentCounter) => {
        this.commentCounter = commentCounter;
        this.wsCommentService
          .getCommentStream(this.room.id)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((message: Message) => {
            this.commentCounter =
              this.commentService.getUpdatedCommentCountWithMessage(
                this.commentCounter,
                message
              );
          });
      });
  }

  prepareAttachmentData() {
    this.attachmentData = {
      refId: this.room.id,
      refType: 'room',
      role: this.viewRole,
      detailedView: true,
      pureImageView: false,
    };
  }

  getRoomJoinUrl(): string {
    return this.routingService.getRoomJoinUrl(
      this.apiConfig.ui.links?.join?.url
    );
  }
}
