import { Component, OnDestroy } from '@angular/core';
import { Room } from '../../../models/room';
import { ContentGroup } from '../../../models/content-group';
import { RoomStats } from '../../../models/room-stats';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { EventService } from '../../../services/util/event.service';
import { IMessage, Message } from '@stomp/stompjs';
import { Observable, Subscription } from 'rxjs';
import { ContentService } from '../../../services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/util/notification.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { UserRole } from '../../../models/user-roles.enum';
import { InfoBarItem } from '../bars/info-bar/info-bar.component';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { DataChanged } from '../../../models/events/data-changed';

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss']
})
export class RoomPageComponent implements OnDestroy {

  deviceWidth = innerWidth;
  room: Room = null;
  protected roomStats: RoomStats;
  protected contentGroups: ContentGroup[] = [];
  protected groupNames: string[] = [];
  isLoading = true;
  errorOnLoading = false;
  commentCounter: number;
  protected moderationEnabled = false;
  protected sub: Subscription;
  protected roomSub: Subscription;
  protected roomWatch: Observable<IMessage>;
  protected commentWatch: Observable<IMessage>;
  protected attachmentData: any;
  moderationCommentWatch: Observable<IMessage>;
  moderationSub: Subscription;
  moderatorCommentCounter: number;
  infoBarItems: InfoBarItem[] = [];
  role: UserRole;
  roleIconString;
  onChangeSubscription: Subscription;

  constructor(
    protected roomService: RoomService,
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected location: Location,
    protected wsCommentService: WsCommentServiceService,
    protected commentService: CommentService,
    protected eventService: EventService,
    protected contentService: ContentService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected globalStorageService: GlobalStorageService
  ) {
  }

  ngOnDestroy() {
    this.eventService.makeFocusOnInputFalse();
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.roomSub) {
      this.roomSub.unsubscribe();
    }
    this.onChangeSubscription.unsubscribe();
    this.unsubscribe();
  }

  protected unsubscribe() {

  }

  protected afterRoomLoadHook() {

  }

  protected afterGroupsLoadHook() {

  }

  parseUserCount(body: string) {
    this.infoBarItems[0].count = JSON.parse(body).UserCountChanged.userCount;
  }

  subscribeCommentStream() {
    this.commentService.countByRoomId(this.room.id, true).subscribe(commentCounter => {
      this.commentCounter = commentCounter;
      this.commentWatch = this.wsCommentService.getCommentStream(this.room.id);
      if (this.sub) {
        this.sub.unsubscribe();
      }
      this.sub = this.commentWatch.subscribe((message: Message) => {
        const msg = JSON.parse(message.body);
        const payload = msg.payload;
        if (msg.type === 'CommentCreated') {
          this.commentCounter = this.commentCounter + 1;
        } else if (msg.type === 'CommentDeleted') {
          this.commentCounter = this.commentCounter - 1;
        } else if (msg.type === 'CommentPatched') {
          for (const [key, value] of Object.entries(payload.changes)) {
            switch (key) {
              case 'ack':
                const isNowAck = <boolean>value;
                if (isNowAck) {
                  this.moderatorCommentCounter = this.moderatorCommentCounter - 1;
                } else {
                  this.commentCounter = this.commentCounter - 1;
                }
                break;
            }
          }
        }
      });
    });
  }

  subscribeCommentModeratorStream() {
    this.commentService.countByRoomId(this.room.id, false).subscribe(commentCounter => {
      this.moderatorCommentCounter = commentCounter;
    });
    this.moderationCommentWatch = this.wsCommentService.getModeratorCommentStream(this.room.id);
    if (this.moderationSub) {
      this.moderationSub.unsubscribe();
    }
    this.moderationSub = this.moderationCommentWatch.subscribe((message: Message) => {
      const msg = JSON.parse(message.body);
      const payload = msg.payload;
      if (msg.type === 'CommentCreated') {
        this.moderatorCommentCounter = this.moderatorCommentCounter + 1;
      } else if (msg.type === 'CommentDeleted') {
        this.moderatorCommentCounter = this.moderatorCommentCounter - 1;
      }
    });
  }

  initializeRoom(room: Room, role: UserRole, viewRole: UserRole): void {
    this.room = room;
    const changeEventType = viewRole === UserRole.PARTICIPANT ? 'PublicDataChanged' : 'ModeratorDataChanged';
    this.onChangeSubscription = this.eventService.on<DataChanged<RoomStats>>(changeEventType)
        .subscribe(() => this.initializeStats(viewRole));
    this.initializeStats(viewRole);
    if (this.room.extensions && this.room.extensions.comments) {
      if (this.room.extensions.comments['enableModeration'] !== null) {
        this.moderationEnabled = this.room.extensions.comments['enableModeration'];
        // ToDo: make room data cache that's available for components that manages data flow and put that there
      }
    }
    this.globalStorageService.setItem(STORAGE_KEYS.MODERATION_ENABLED, String(this.moderationEnabled));
    this.afterRoomLoadHook();
    this.globalStorageService.setItem(STORAGE_KEYS.SHORT_ID, room.shortId);
    this.role = role === viewRole ? UserRole.NONE : role;
    this.getRoleIcon();

  }

  getRoleIcon() {
    if (this.role === UserRole.NONE) {
      this.roleIconString = 'people';
    } else {
      this.getUserRoleIcon();
    }
  }

  getUserRoleIcon() {
    if (this.role === UserRole.CREATOR) {
      this.roleIconString = 'record_voice_over';
    } else if (['EDITING_MODERATOR', 'EXECUTIVE_MODERATOR'].indexOf(this.role) !== -1) {
      this.roleIconString = 'gavel';
    }
  }

  initializeStats(viewRole: UserRole) {
    let extendedView = [UserRole.CREATOR, UserRole.EDITING_MODERATOR, UserRole.EXECUTIVE_MODERATOR].includes(viewRole);
    this.roomStatsService.getStats(this.room.id, extendedView).subscribe(roomStats => {
      this.roomStats = roomStats;
      if (this.roomStats.groupStats) {
        this.initializeGroups();
      } else {
        this.isLoading = false;
        this.afterGroupsLoadHook();
      }
    });
  }

  initializeGroups() {
    this.contentGroups.splice(0, this.contentGroups.length);
    for (let i = 0; i < this.roomStats.groupStats.length; i++) {
      this.contentGroupService.getById(this.roomStats.groupStats[i].id, { roomId: this.room.id }).subscribe(group => {
        this.contentGroups.push(group);
        this.groupNames.push(group.name);
        if (this.groupNames.length === this.roomStats.groupStats.length) {
          this.afterGroupsLoadHook();
        }
      });
    }
  }

  delete(room: Room): void {
    this.roomService.deleteRoom(room.id).subscribe();
    this.location.back();
  }

  prepareAttachmentData(role: UserRole) {
    this.attachmentData = {
      refId: this.room.id,
      refType: 'room',
      roomId: this.room.id,
      role: role,
      detailedView: true,
      pureImageView: false
    };
  }

  switchRole(role?: string) {
    let roleRoute;
    if (role) {
      roleRoute = role;
    } else {
      switch (this.role) {
        case UserRole.CREATOR:
          roleRoute = 'creator';
          break;
        case UserRole.EXECUTIVE_MODERATOR || UserRole.EDITING_MODERATOR:
          roleRoute = 'moderator';
          break;
        case UserRole.PARTICIPANT:
          roleRoute = 'participant';
          break;
      }
    }
    this.router.navigate([`/${roleRoute}/room/${this.room.shortId}`]);
  }
}
