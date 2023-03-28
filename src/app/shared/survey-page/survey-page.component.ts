import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { RoomService } from '@core/services/http/room.service';
import { UserRole } from '@core/models/user-roles.enum';
import { Room } from '@core/models/room';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@core/services/util/notification.service';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '@core/services/websockets/ws-feedback.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/services/util/language.service';
import { Survey } from '@core/models/survey';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@core/services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AnnounceService } from '@core/services/util/announce.service';
import { FeedbackService } from '@core/services/http/feedback.service';
import { FeedbackMessageType } from '@core/models/messages/feedback-message-type';
import { HotkeyAction } from '@core/directives/hotkey.directive';
import { HotkeyService } from '@core/services/util/hotkey.service';
import { RemoteService } from '@core/services/util/remote.service';

@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.scss'],
})
export class SurveyPageComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  isPresentation = false;

  feedbackIcons = [
    'sentiment_very_satisfied',
    'sentiment_satisfied_alt',
    'sentiment_very_dissatisfied',
    'mood_bad',
  ];
  feedbackLabels = [
    'feeling-very-good',
    'feeling-good',
    'feeling-not-so-good',
    'feeling-bad',
  ];
  surveyLabels = ['survey-a', 'survey-b', 'survey-c', 'survey-d'];
  typeSurvey = 'SURVEY';
  typeFeedback = 'FEEDBACK';

  survey: Survey[] = [];

  userRole: typeof UserRole = UserRole;
  role: UserRole;
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
  toggleKey = '1';
  changeKey = '2';
  voteKeys = ['1', '2', '3', '4'];
  hotkeyAction = HotkeyAction.FOCUS;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private wsFeedbackService: WsFeedbackService,
    private feedbackService: FeedbackService,
    private roomService: RoomService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    private remoteService: RemoteService,
    private hotkeyService: HotkeyService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('message-announcer-button').focus();
    }, 500);
  }

  ngOnInit() {
    this.isPresentation = this.route.snapshot.data.isPresentation;
    if (this.isPresentation) {
      this.hotkeyAction = HotkeyAction.CLICK;
      this.toggleKey = ' ';
      this.changeKey = 'c';
    }
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.userId = auth.userId));
    this.route.data.subscribe((data) => {
      this.roomId = data.room.id;
      this.shortId = data.room.shortId;
      this.role = data.viewRole;
      this.loadConfig(data.room);
      this.feedbackService.startSub(data.room.id);
      this.sub = this.feedbackService.messageEvent.subscribe((message) => {
        this.parseIncomingMessage(message);
      });
      this.feedbackService.get(this.roomId).subscribe((values: number[]) => {
        this.updateFeedback(values);
      });
      this.isLoading = false;
      if (this.isPresentation) {
        if (!this.isClosed) {
          this.remoteService.updateFeedbackStateChange(true);
        }
        const scale = Math.max(Math.min(innerWidth, 2100) / 1500, 1);
        document.getElementById(
          'survey-card'
        ).style.transform = `scale(${scale})`;
      }
    });
    this.translateService.get('survey.status-summary').subscribe((t) =>
      this.hotkeyService.registerHotkey(
        {
          key: '5',
          action: () => !this.isClosed && this.announceStatus(),
          actionTitle: t,
        },
        this.hotkeyRefs
      )
    );
  }

  announceStatus() {
    this.translateService
      .get(this.survey.map((s) => s.label))
      .subscribe((labels) => {
        const answerLabels: string[] = labels;
        this.translateService
          .get(this.isClosed ? 'survey.a11y-stopped' : 'survey.a11y-started')
          .subscribe((status) => {
            this.announceService.announce('survey.a11y-status', {
              status: status,
              answers: this.answerCount,
              state0: this.survey[0].count || 0,
              state1: this.survey[1].count || 0,
              state2: this.survey[2].count || 0,
              state3: this.survey[3].count || 0,
              answer0: answerLabels[this.survey[0].label],
              answer1: answerLabels[this.survey[1].label],
              answer2: answerLabels[this.survey[2].label],
              answer3: answerLabels[this.survey[3].label],
            });
          });
      });
  }

  announceType() {
    this.translateService
      .get(
        this.type === this.typeSurvey
          ? 'survey.a11y-type-survey'
          : 'survey.a11y-type-feedback'
      )
      .subscribe((type) => {
        this.announceService.announce('survey.a11y-selected-type', {
          type: type,
        });
      });
  }

  announceAnswer(answerLabelKey: string) {
    this.translateService.get(answerLabelKey).subscribe((answer) => {
      this.announceService.announce('survey.a11y-selected-answer', {
        answer: answer,
      });
    });
  }

  loadConfig(room: Room) {
    this.room = room;
    this.isClosed = room.settings['feedbackLocked'];
    if (
      this.room.extensions &&
      this.room.extensions.feedback &&
      this.room.extensions.feedback['type']
    ) {
      this.type = this.room.extensions.feedback['type'];
    } else {
      if (this.role === UserRole.OWNER) {
        this.roomService.changeFeedbackType(this.roomId, this.type);
      }
    }
    this.getLabels();
  }

  getLabels() {
    const labels =
      this.type === this.typeSurvey ? this.surveyLabels : this.feedbackLabels;
    for (let i = 0; i < this.surveyLabels.length; i++) {
      const label = labels[i];
      const section = 'survey.';
      const subsection = 'a11y-';
      this.survey[i] = new Survey(
        i,
        label,
        section + label,
        section + subsection + label,
        0
      );
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  private updateFeedback(data) {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const sum = data.reduce(reducer);
    this.answerCount = sum;
    for (let i = 0; i < this.survey.length; i++) {
      this.survey[i].count = (data[i] / sum) * 100;
    }
  }

  changeType() {
    this.type =
      this.type === this.typeFeedback ? this.typeSurvey : this.typeFeedback;
    this.getLabels();
    this.roomService.changeFeedbackType(this.roomId, this.type);
    this.announceType();
    if (!this.isPresentation) {
      setTimeout(() => {
        document.getElementById('toggle-button').focus();
      }, 500);
    }
  }

  updateRoom(isClosed: boolean) {
    this.roomService.changeFeedbackLock(this.roomId, isClosed);
    if (isClosed) {
      this.reset();
    }
  }

  submitAnswer(state: number) {
    if (this.role === UserRole.PARTICIPANT) {
      this.wsFeedbackService.send(this.userId, state, this.roomId);
    }
  }

  submitAnswerViaEnter(state: number, answerLabel: string) {
    this.submitAnswer(state);
    this.announceAnswer(answerLabel);
  }

  toggle() {
    this.updateRoom(!this.isClosed);
    const state = this.isClosed ? 'started' : 'stopped';
    this.translateService.get('survey.' + state).subscribe((msg) => {
      this.notificationService.showAdvanced(
        msg,
        state === 'started'
          ? AdvancedSnackBarTypes.SUCCESS
          : AdvancedSnackBarTypes.WARNING
      );
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
        this.roomService.getRoom(this.roomId).subscribe((room) => {
          this.loadConfig(room);
          this.isClosed = false;
        });
        if (this.role === UserRole.OWNER) {
          this.remoteService.updateFeedbackStateChange(true);
        }
        break;
      case FeedbackMessageType.STOPPED:
        this.room.settings['feedbackLocked'] = true;
        this.isClosed = true;
        if (this.role === UserRole.OWNER) {
          this.remoteService.updateFeedbackStateChange(false);
        }
        break;
      case FeedbackMessageType.STATUS:
        this.isClosed = payload.closed;
        break;
      case FeedbackMessageType.RESET:
        this.updateFeedback([0, 0, 0, 0]);
    }
  }
}
