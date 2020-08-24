import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss']
})
export class RoomPageComponent implements OnInit, OnDestroy {

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
  protected commentWatch: Observable<IMessage>;
  protected noGroups = true;
  moderationCommentWatch: Observable<IMessage>;
  moderationSub: Subscription;
  moderatorCommentCounter: number;

  constructor(
    protected roomService: RoomService,
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

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.initializeRoom(params['shortId']);
    });
  }

  ngOnDestroy() {
    this.eventService.makeFocusOnInputFalse();
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.unsubscribe();
  }

  protected unsubscribe() {

  }

  protected afterRoomLoadHook() {

  }

  protected afterGroupsLoadHook() {

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

  initializeRoom(room: Room): void {
    this.room = room;
    this.initializeStats();
    if (this.room.extensions && this.room.extensions['comments']) {
      if (this.room.extensions['comments'].enableModeration !== null) {
        this.moderationEnabled = this.room.extensions['comments'].enableModeration;
        // ToDo: make room data cache that's available for components that manages data flow and put that there
      }
    }
    this.globalStorageService.setItem(STORAGE_KEYS.MODERATION_ENABLED, String(this.moderationEnabled));
    this.afterRoomLoadHook();
    this.globalStorageService.setItem(STORAGE_KEYS.SHORT_ID, room.shortId);
  }

  initializeStats() {
    this.roomService.getStats(this.room.id).subscribe(roomStats => {
      this.roomStats = roomStats;
      if (this.roomStats.groupStats) {
        this.noGroups = false;
        this.initializeGroups();
      } else {
        this.isLoading = false;
        this.afterGroupsLoadHook();
      }
    });
  }

  initializeGroups() {
    for (let i = 0; i < this.roomStats.groupStats.length; i++) {
      this.roomService.getGroupByRoomIdAndName(this.room.id, this.roomStats.groupStats[i].groupName).subscribe(group => {
        this.contentGroups.push(group);
        this.groupNames.push(group.name);
        if (this.groupNames.length === this.roomStats.groupStats.length) {
          this.afterGroupsLoadHook();
        }
      });
    }
  }

  navToStats(role: string) {
    if (this.noGroups) {
      this.translateService.get('room-page.no-contents').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    } else {
      this.router.navigate([`/${role}/room/${this.room.shortId}/statistics`]);
    }
  }

  delete(room: Room): void {
    this.roomService.deleteRoom(room.id).subscribe();
    this.location.back();
  }
}
