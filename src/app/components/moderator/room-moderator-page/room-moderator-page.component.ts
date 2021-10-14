import { AfterContentInit, Component, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Location } from '@angular/common';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentService } from '../../../services/websockets/ws-comment.service';
import { CommentService } from '../../../services/http/comment.service';
import { ContentService } from '../../../services/http/content.service';
import { NotificationService } from '../../../services/util/notification.service';
import { EventService } from '../../../services/util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { UserRole } from '../../../models/user-roles.enum';
import { InfoBarItem } from '../../shared/bars/info-bar/info-bar.component';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { DataChanged } from '../../../models/events/data-changed';
import { RoomStats } from '../../../models/room-stats';

@Component({
  selector: 'app-room-moderator-page',
  templateUrl: './room-moderator-page.component.html',
  styleUrls: ['./room-moderator-page.component.scss']
})
export class RoomModeratorPageComponent extends RoomPageComponent implements OnInit, AfterContentInit {

  room: Room;

  constructor(
    protected location: Location,
    protected roomService: RoomService,
    protected roomStatsService: RoomStatsService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentService,
    protected commentService: CommentService,
    protected contentService: ContentService,
    protected notification: NotificationService,
    public eventService: EventService,
    protected globalStorageService: GlobalStorageService
  ) {
    super(roomService, roomStatsService, contentGroupService, route, router, location, wsCommentService,
      commentService, eventService, contentService, translateService, notification, globalStorageService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live_announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.data.subscribe(data => {
      this.initializeRoom(data.room, data.userRole, data.viewRole);
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  initializeRoom(room: Room, role: UserRole, viewRole: UserRole): void {
    this.room = room;
    this.onChangeSubscription = this.eventService.on<DataChanged<RoomStats>>('ModeratorDataChanged')
      .subscribe(() => this.initializeStats(viewRole));
    this.roomService.getRoomSummaries([room.id]).subscribe(summary => {
      this.infoBarItems.push(new InfoBarItem('user-counter', 'people', summary[0].stats.roomUserCount));
      this.isLoading = false;
    });
    this.subscribeCommentStream();
    this.role = role === viewRole ? UserRole.NONE : role;
    this.getRoleIcon();
  }
}
