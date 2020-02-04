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
import { NotificationService } from '../../../services/util/notification.service';

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss']
})
export class RoomPageComponent implements OnInit, OnDestroy {
  room: Room = null;
  protected roomStats: RoomStats;
  protected contentGroups: ContentGroup[] = [];
  protected groupNames: string[] = [];
  isLoading = true;
  commentCounter: number;
  protected moderationEnabled = false;
  protected sub: Subscription;
  protected commentWatch: Observable<IMessage>;
  protected listenerFn: () => void;
  protected noGroups = true;

  constructor(protected roomService: RoomService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected location: Location,
              protected wsCommentService: WsCommentServiceService,
              protected commentService: CommentService,
              protected eventService: EventService,
              protected contentService: ContentService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.initializeRoom(params['shortId']);
    });
  }

  ngOnDestroy() {
    this.listenerFn();
    this.eventService.makeFocusOnInputFalse();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  protected afterRoomLoadHook() {

  }

  protected afterGroupsLoadHook() {

  }

  initializeRoom(shortId: string): void {
    this.roomService.getRoomByShortId(shortId).subscribe(room => {
      this.room = room;
      this.initializeStats();
      if (this.room.extensions && this.room.extensions['comments']) {
        if (this.room.extensions['comments'].enableModeration !== null) {
          this.moderationEnabled = this.room.extensions['comments'].enableModeration;
          // ToDo: make room data cache that's available for components that manages data flow and put that there
        }
      }
      localStorage.setItem('moderationEnabled', String(this.moderationEnabled));
      this.commentService.countByRoomId(this.room.id, true)
        .subscribe(commentCounter => {
          this.commentCounter = commentCounter;
        });
      this.commentWatch = this.wsCommentService.getCommentStream(this.room.id);
      this.sub = this.commentWatch.subscribe((message: Message) => {
        const msg = JSON.parse(message.body);
        const payload = msg.payload;
        if (msg.type === 'CommentCreated') {
          this.commentCounter = this.commentCounter + 1;
        } else if (msg.type === 'CommentDeleted') {
          this.commentCounter = this.commentCounter - 1;
        }
      });
      this.afterRoomLoadHook();
    });
  }

  initializeStats() {
    this.roomService.getStats(this.room.id).subscribe(roomStats => {
      this.roomStats = roomStats;
      if (this.roomStats.groupStats) {
        this.noGroups = false;
        this.initializeGroups();
      } else {
        this.isLoading = false;
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
        this.notificationService.show(msg);
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
