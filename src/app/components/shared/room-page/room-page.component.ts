import { Component, OnDestroy } from '@angular/core';
import { Room } from '../../../models/room';
import { ContentGroup } from '../../../models/content-group';
import { RoomStats } from '../../../models/room-stats';
import { ActivatedRoute } from '@angular/router';
import { WsCommentService } from '../../../services/websockets/ws-comment.service';
import { CommentService } from '../../../services/http/comment.service';
import { EventService } from '../../../services/util/event.service';
import { IMessage, Message } from '@stomp/stompjs';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { UserRole } from '../../../models/user-roles.enum';
import { InfoBarItem } from '../bars/info-bar/info-bar.component';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { DataChanged } from '../../../models/events/data-changed';

@Component({
  selector: 'app-room-page',
  template: '',
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
  protected sub: Subscription;
  protected roomSub: Subscription;
  protected roomWatch: Observable<IMessage>;
  protected commentWatch: Observable<IMessage>;
  protected attachmentData: any;
  infoBarItems: InfoBarItem[] = [];
  role: UserRole;
  onChangeSubscription: Subscription;

  constructor(
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    protected wsCommentService: WsCommentService,
    protected commentService: CommentService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected globalStorageService: GlobalStorageService
  ) {
  }

  ngOnDestroy() {
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
                if (!isNowAck) {
                  this.commentCounter = this.commentCounter - 1;
                }
                break;
            }
          }
        }
      });
    });
  }

  initializeRoom(room: Room, role: UserRole, viewRole: UserRole): void {
    this.room = room;
    const changeEventType = viewRole === UserRole.PARTICIPANT ? 'PublicDataChanged' : 'ModeratorDataChanged';
    this.onChangeSubscription = this.eventService.on<DataChanged<RoomStats>>(changeEventType)
        .subscribe(() => this.initializeStats(viewRole));
    this.initializeStats(viewRole);
    this.afterRoomLoadHook();
    this.globalStorageService.setItem(STORAGE_KEYS.SHORT_ID, room.shortId);
    this.role = role === viewRole ? UserRole.NONE : role;

  }

  initializeStats(viewRole: UserRole) {
    let extendedView = [UserRole.CREATOR, UserRole.EDITING_MODERATOR, UserRole.EXECUTIVE_MODERATOR].includes(viewRole);
    this.roomStatsService.getStats(this.room.id, extendedView).subscribe(roomStats => {
      this.roomStats = roomStats;
      if (this.roomStats.groupStats?.length > 0) {
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

  prepareAttachmentData(role: UserRole) {
    this.attachmentData = {
      refId: this.room.id,
      refType: 'room',
      role: role,
      detailedView: true,
      pureImageView: false
    };
  }
}
