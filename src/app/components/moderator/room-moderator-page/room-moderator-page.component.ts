import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Location } from '@angular/common';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { ContentService } from '../../../services/http/content.service';
import { Message, IMessage } from '@stomp/stompjs';
import { NotificationService } from '../../../services/util/notification.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-room-moderator-page',
  templateUrl: './room-moderator-page.component.html',
  styleUrls: ['./room-moderator-page.component.scss']
})
export class RoomModeratorPageComponent extends RoomPageComponent implements OnInit, AfterContentInit {

  room: Room;
  moderatorCommentCounter: number;
  viewModuleCount = 1;
  moderationCommentWatch: Observable<IMessage>;
  moderationSub: Subscription;

  constructor(
    protected location: Location,
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentServiceService,
    protected commentService: CommentService,
    protected contentService: ContentService,
    protected notification: NotificationService,
    public eventService: EventService,
    private announceService: AnnounceService,
    protected globalStorageService: GlobalStorageService
  ) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notification, globalStorageService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      if (this.moderationEnabled) {
        document.getElementById('comments-button').focus();
      } else {
        document.getElementById('comments-button2').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      if (this.moderationEnabled) {
        document.getElementById('moderation-button').focus();
      } else {
        document.getElementById('moderation-disabled').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live_announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.data.subscribe(data => {
      this.initializeRoom(data.room);
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  public announce() {
    this.announceService.announce('room-page.a11y-moderator-shortcuts');
  }

  initializeRoom(room: Room): void {
    this.room = room;
    this.isLoading = false;
    if (this.room.extensions && this.room.extensions['comments']) {
      if (this.room.extensions['comments'].enableModeration !== null) {
        this.moderationEnabled = this.room.extensions['comments'].enableModeration;
        this.viewModuleCount = this.viewModuleCount + 1;
      }
    }
    this.commentService.countByRoomId(this.room.id, true).subscribe(commentCounter => {
      this.commentCounter = commentCounter;
    });
    if (this.moderationEnabled) {
      this.commentService.countByRoomId(this.room.id, false).subscribe(commentCounter => {
        this.moderatorCommentCounter = commentCounter;
      });
    }

    this.commentWatch = this.wsCommentService.getCommentStream(this.room.id);
    this.moderationCommentWatch = this.wsCommentService.getModeratorCommentStream(this.room.id);

    this.sub.unsubscribe();

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
}
