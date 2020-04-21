import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-roles.enum';
import { RoomPageComponent } from '../../shared/room-page/room-page.component';
import { Location } from '@angular/common';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { WsCommentServiceService } from '../../../services/websockets/ws-comment-service.service';
import { CommentService } from '../../../services/http/comment.service';
import { ContentService } from '../../../services/http/content.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { NotificationService } from '../../../services/util/notification.service';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import { WsFeedbackService } from '../../../services/websockets/ws-feedback.service';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-room-participant-page',
  templateUrl: './room-participant-page.component.html',
  styleUrls: ['./room-participant-page.component.scss']
})
export class RoomParticipantPageComponent extends RoomPageComponent implements OnInit, AfterContentInit, OnDestroy {

  room: Room;
  user: User;
  protected feedbackSub: Subscription;
  feedbackEnabled = false;

  constructor(
    protected location: Location,
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected wsCommentService: WsCommentServiceService,
    protected commentService: CommentService,
    protected contentService: ContentService,
    protected authenticationService: AuthenticationService,
    private announceService: AnnounceService,
    public eventService: EventService,
    private wsFeedbackService: WsFeedbackService,
    protected globalStorageService: GlobalStorageService
  ) {
    super(roomService, route, router, location, wsCommentService, commentService, eventService, contentService, translateService,
      notificationService, globalStorageService);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('comments-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      if (this.feedbackEnabled) {
        document.getElementById('live-feedback-button').focus();
      } else {
        document.getElementById('live-feedback-disabled').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      if (this.contentGroups.length > 0) {
        document.getElementById('content-groups').focus();
      } else {
        document.getElementById('no-content-groups').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('statistics-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit9, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === true) {
      this.eventService.makeFocusOnInputFalse();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('live-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.route.data.subscribe(data => {
      this.initializeRoom(data.room);
    });
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.feedbackSub) {
      this.feedbackSub.unsubscribe();
    }
  }

  public announce() {
    this.announceService.announce('room-page.a11y-keys');
  }

  afterRoomLoadHook() {
    this.authenticationService.watchUser.subscribe(user => this.user = user);
    if (!this.user) {
      this.authenticationService.guestLogin(UserRole.PARTICIPANT).subscribe(() => {
        this.roomService.addToHistory(this.room.id);
      });
    } else {
      this.roomService.addToHistory(this.room.id);
    }
    this.authenticationService.setAccess(this.room.shortId, UserRole.PARTICIPANT);
    this.authenticationService.checkAccess(this.room.shortId);
    this.feedbackEnabled = !this.room.settings['feedbackLocked'];
    this.feedbackSub = this.wsFeedbackService.getFeedbackStream(this.room.id).subscribe((message: Message) => {
      this.parseFeedbackMessage(message);
    });
  }

  protected afterGroupsLoadHook() {
    this.isLoading = false;
  }

  parseFeedbackMessage(message: Message) {
    const msg = JSON.parse(message.body);
    if (msg.type === 'FeedbackStarted') {
      this.feedbackEnabled = true;
    } else if (msg.type === 'FeedbackStopped') {
      this.feedbackEnabled = false;
    }
  }
}
