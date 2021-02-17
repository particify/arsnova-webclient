import { AfterContentInit, Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { RoomService } from '../../../services/http/room.service';
import { UserRole } from '../../../models/user-roles.enum';
import { Room } from '../../../models/room';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '../../../services/websockets/ws-feedback.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { Survey } from '../../../models/survey';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AnnounceService } from '../../../services/util/announce.service';
import { FeedbackService } from '../../../services/http/feedback.service';
import { FeedbackMessageType } from '@arsnova/app/models/messages/feedback-message-type';

@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.scss']
})
export class SurveyPageComponent implements OnInit, OnDestroy, AfterContentInit {

  feedbackIcons = ['sentiment_very_satisfied', 'sentiment_satisfied_alt', 'sentiment_very_dissatisfied', 'mood_bad'];
  feedbackLabels = ['feeling-very-good', 'feeling-good', 'feeling-not-so-good', 'feeling-bad'];
  surveyLabels = ['survey-a', 'survey-b', 'survey-c', 'survey-d'];
  typeSurvey = 'SURVEY';
  typeFeedback = 'FEEDBACK';

  survey: Survey[] = [];

  isCreator = false;
  userId: string;
  roomId: string;
  shortId: string;
  room: Room;
  protected sub: Subscription;
  isClosed = false;
  isLoading = true;
  type = this.typeFeedback;
  deviceWidth = innerWidth;
  answerCount = 0;

  constructor(
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private wsFeedbackService: WsFeedbackService,
    private feedbackService: FeedbackService,
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
    if (this.isCreator) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
        document.getElementById('toggle-button').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
        if (this.isClosed) {
          document.getElementById('switch-button').focus();
        } else {
          const msg = this.translateService.instant('survey.a11y-first-stop-survey');
          this.announceService.announce(msg);
        }
      }
    } else {
      if (!this.isClosed) {
        if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
          document.getElementById('survey-button-0').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
          document.getElementById('survey-button-1').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
          document.getElementById('survey-button2-2').focus();
        } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true) {
          document.getElementById('survey-button2-3').focus();
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
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.userId = auth.userId);
    this.route.data.subscribe(data => {
      this.roomId = data.room.id;
      this.shortId = data.room.shortId;
      this.loadConfig(data.room);
      this.isCreator = data.viewRole === UserRole.CREATOR;
      this.feedbackService.startSub(data.room.id);
      this.sub = this.feedbackService.messageEvent.subscribe(message => {
        this.parseIncomingMessage(message);
      });
      this.feedbackService.get(this.roomId).subscribe((values: number[]) => {
        this.updateFeedback(values);
      });
      this.isLoading = false;
    });
  }

  announceKeys() {
    this.announceService.announce('survey.a11y-shortcuts');
  }

  announceStatus() {
    this.translateService.get(this.isClosed ? 'survey.a11y-stopped' : 'survey.a11y-started').subscribe(status => {
      this.announceService.announce('survey.a11y-status', { status: status, answers: this.answerCount,
        state0: this.survey[0].count, state1: this.survey[1].count, state2: this.survey[2].count, state3: this.survey[3].count });
    });
  }

  announceType() {
    this.translateService.get(this.type === this.typeSurvey ? 'survey.a11y-type-survey' : 'survey.a11y-type-feedback').subscribe(type => {
      this.announceService.announce('survey.a11y-selected-type', { type: type });
    });
  }

  announceAnswer(answerLabelKey: string) {
    this.translateService.get(answerLabelKey).subscribe(answer => {
      this.announceService.announce('survey.a11y-selected-answer', { answer: answer });
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
  }

  getLabels() {
    const labels = this.type === this.typeSurvey ? this.surveyLabels : this.feedbackLabels;
    for (let i = 0; i < this.surveyLabels.length; i++) {
      const label = labels[i];
      const section = 'survey.';
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
    this.answerCount = sum;
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
    if (!this.isCreator) {
      this.wsFeedbackService.send(this.userId, state, this.roomId);
    }
  }

  submitAnswerViaEnter(state: number, answerLabel: string) {
    this.submitAnswer(state);
    this.announceAnswer(answerLabel);
  }

  toggle() {
    this.updateRoom(!this.isClosed);
    const a11yPrefix = 'survey.a11y-';
    const currentState = this.isClosed ? 'started' : 'stopped';
    const nextState = this.isClosed ? 'start' : 'stop';
    const keys = [a11yPrefix + currentState,
                  a11yPrefix + nextState];
    this.translateService.get(keys).subscribe(status => {
      this.announceService.announce(a11yPrefix + 'status-changed',
        { status: status[keys[0]], nextStatus: status[keys[1]] });
    });
    this.translateService.get('survey.' + currentState).subscribe(msg => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }

  reset() {
    this.wsFeedbackService.reset(this.roomId);
  }

  parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case FeedbackMessageType.CHANGED:
        this.updateFeedback(payload.values);
        break;
      case FeedbackMessageType.STARTED:
        this.roomService.getRoom(this.roomId).subscribe(room => {
          this.loadConfig(room);
          this.isClosed = false;
        });
        break;
      case FeedbackMessageType.STOPPED:
        this.isClosed = true;
        break;
      case FeedbackMessageType.STATUS:
        this.isClosed = payload.closed;
        break;
      case FeedbackMessageType.RESET:
        this.updateFeedback([0, 0, 0, 0]);
    }
  }
}
