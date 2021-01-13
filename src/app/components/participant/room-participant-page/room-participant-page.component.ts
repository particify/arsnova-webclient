import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { NotificationService } from '../../../services/util/notification.service';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import { WsFeedbackService } from '../../../services/websockets/ws-feedback.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { UserRole } from '../../../models/user-roles.enum';
import { FeedbackMessageType } from '../../../models/messages/feedback-message-type';
import { FeedbackService } from '../../../services/http/feedback.service';

@Component({
  selector: 'app-room-participant-page',
  templateUrl: './room-participant-page.component.html',
  styleUrls: ['./room-participant-page.component.scss']
})
export class RoomParticipantPageComponent extends RoomPageComponent implements OnInit, AfterContentInit, OnDestroy {

  room: Room;
  protected surveySub: Subscription;
  surveyEnabled = false;

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
    protected globalStorageService: GlobalStorageService,
    private feedbackService: FeedbackService
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
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      if (this.surveyEnabled) {
        document.getElementById('live-survey-button').focus();
      } else {
        document.getElementById('live-survey-disabled').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      if (this.contentGroups.length > 0) {
        document.getElementById('content-groups').focus();
      } else {
        document.getElementById('no-content-groups').focus();
      }
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('statistics-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && focusOnInput === false) {
      this.announce();
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
      this.initializeRoom(data.room, data.userRole, data.viewRole);
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  unsubscribe() {
    if (this.surveySub) {
      this.surveySub.unsubscribe();
      this.feedbackService.unsubscribe();
    }
  }

  public announce() {
    this.announceService.announce('room-page.a11y-shortcuts');
  }

  getFeedback() {
    this.surveyEnabled = !this.room.settings['feedbackLocked'];
    this.feedbackService.startSub(this.room.id);
    this.surveySub = this.feedbackService.messageEvent.subscribe((message: Message) => {
      this.parseFeedbackMessage(message);
    });
  }

  afterRoomLoadHook() {
    this.getFeedback();
    this.initRoomData();
  }

  initRoomData() {
    this.prepareAttachmentData(UserRole.PARTICIPANT);
    this.subscribeCommentStream();
  }

  afterGroupsLoadHook() {
    this.isLoading = false;
  }

  parseFeedbackMessage(message: Message) {
    const msg = JSON.parse(message.body);
    if (msg.type === FeedbackMessageType.STARTED) {
      this.surveyEnabled = true;
    } else if (msg.type === FeedbackMessageType.STOPPED) {
      this.surveyEnabled = false;
    }
  }
}
