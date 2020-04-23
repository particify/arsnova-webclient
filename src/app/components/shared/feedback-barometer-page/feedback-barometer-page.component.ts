import { AfterContentInit, Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { RoomService } from '../../../services/http/room.service';
import { UserRole } from '../../../models/user-roles.enum';
import { User } from '../../../models/user';
import { Room } from '../../../models/room';
import { NotificationService } from '../../../services/util/notification.service';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '../../../services/websockets/ws-feedback.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { Survey } from '../../../models/survey';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-feedback-barometer-page',
  templateUrl: './feedback-barometer-page.component.html',
  styleUrls: ['./feedback-barometer-page.component.scss']
})
export class FeedbackBarometerPageComponent implements OnInit, OnDestroy, AfterContentInit {

  feedbackLabels = ['sentiment_very_satisfied', 'sentiment_satisfied', 'sentiment_dissatisfied', 'sentiment_very_dissatisfied'];
  surveyLabels = ['survey-a', 'survey-b', 'survey-c', 'survey-d'];
  typeSurvey = 'SURVEY';
  typeFeedback = 'FEEDBACK';

  survey: Survey[] = [];

  isOwner = false;
  user: User;
  roomId: string;
  shortId: string;
  room: Room;
  protected sub: Subscription;
  isClosed = false;
  isLoading = true;
  type = this.typeFeedback;
  deviceWidth = innerWidth;

  constructor(
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private wsFeedbackService: WsFeedbackService,
    private roomService: RoomService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private _r: Renderer2,
    private globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isOwner) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
        document.getElementById('toggle-button').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
        document.getElementById('switch-button').focus();
      }
    } else {
      if (!this.isClosed) {
        if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
          document.getElementById('feedback-button-0').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
          document.getElementById('feedback-button-1').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
          document.getElementById('feedback-button2-2').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true) {
          document.getElementById('feedback-button2-3').focus();
        }
      } else {
        this.announceStatus();
      }
    }
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announceKeys();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true) {
      this.announceStatus();
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('message-announcer-button').focus();
    }, 200);
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    this.user = this.authenticationService.getUser();
    this.route.data.subscribe(data => {
      this.roomId = data.room.id;
      this.shortId = data.room.shortId;
      this.loadConfig(data.room);
    });
  }

  announceKeys() {
    this.announceService.announce('feedback.a11y-keys');
  }

  announceStatus() {
    this.translateService.get(this.isClosed ? 'feedback.a11y-stopped' : 'feedback.a11y-started').subscribe(status => {
      this.announceService.announce('feedback.a11y-status', { status: status, state0: this.survey[0].count, state1: this.survey[1].count,
        state2: this.survey[2].count, state3: this.survey[3].count });
    });
  }

  announceType() {
    this.translateService.get(this.type === this.typeSurvey ? 'feedback.type-survey' : 'feedback.type-feedback').subscribe(type => {
      this.announceService.announce('feedback.a11y-selected-type', { type: type });
    });
  }

  announceAnswer(answerLabelKey: string) {
    this.translateService.get(answerLabelKey).subscribe(answer => {
      this.announceService.announce('feedback.a11y-selected-answer', { answer: answer });
    });
  }


  loadConfig(room: Room) {
    this.room = room;
    this.isClosed = room.settings['feedbackLocked'];
    if (this.room.extensions && this.room.extensions['feedback'] && this.room.extensions['feedback'].type) {
      this.type = this.room.extensions['feedback'].type;
    } else {
      this.roomService.changeFeedbackType(this.roomId, this.type);
    }
    this.getLabels();
    this.isOwner = this.authenticationService.hasAccess(this.room.shortId, UserRole.CREATOR);
    this.sub = this.wsFeedbackService.getFeedbackStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingMessage(message);
    });
    this.wsFeedbackService.get(this.roomId);
    this.isLoading = false;
  }

  getLabels() {
    const labels = this.type === this.typeSurvey ? this.surveyLabels : this.feedbackLabels;
    for (let i = 0; i < this.surveyLabels.length; i++) {
      const label = labels[i];
      const section = 'feedback.';
      const subsection = 'a11y-';
      this.survey[i] = new Survey(i, label, section + label, section + subsection + label, 0);
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private updateFeedback(data) {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const sum = data.reduce(reducer);
    for (let i = 0; i < this.survey.length; i++) {
      this.survey[i].count = data[i] / sum * 100;
    }
  }

  changeType() {
    this.type = this.type === this.typeFeedback ? this.typeSurvey : this.typeFeedback;
    this.getLabels();
    this.roomService.changeFeedbackType(this.roomId, this.type);
    this.announceType();
    setTimeout(() => {
      document.getElementById('toggle-button').focus();
    }, 500);
  }

  updateRoom(isClosed: boolean) {
    this.roomService.changeFeedbackLock(this.roomId, isClosed);
    if (isClosed) {
      this.reset();
    }
  }

  submitAnswer(state: number) {
    if (!this.isOwner) {
      this.wsFeedbackService.send(this.user.id, state, this.roomId);
    }
  }

  submitAnswerViaEnter(state: number, answerLabel: string, event) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.ENTER) === true) {
      this.submitAnswer(state);
    }
    this.announceAnswer(answerLabel);
  }


  toggle() {
    this.updateRoom(!this.isClosed);
    const keys = [this.isClosed ? 'feedback.a11y-started' : 'feedback.a11y-stopped',
                  this.isClosed ? 'feedback.a11y-stop' : 'feedback.a11y-start'];
    this.translateService.get(keys).subscribe(status => {
      this.announceService.announce('feedback.a11y-status-changed',
        { status: status[keys[0]], nextStatus: status[keys[1]] });
    });
  }

  reset() {
    this.wsFeedbackService.reset(this.roomId);
  }

  parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case 'FeedbackChanged':
        this.updateFeedback(payload.values);
        break;
      case 'FeedbackStarted':
        this.loadConfig(this.room);
        this.isClosed = false;
        break;
      case 'FeedbackStopped':
        this.isClosed = true;
        break;
      case 'FeedbackStatus':
        this.isClosed = payload.closed;
        break;
      case 'FeedbackReset':
        this.updateFeedback([0, 0, 0, 0]);
    }
  }
}
