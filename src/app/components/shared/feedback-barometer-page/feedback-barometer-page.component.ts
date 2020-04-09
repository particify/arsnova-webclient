import { AfterContentInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { Survey } from '../../../models/survey';

@Component({
  selector: 'app-feedback-barometer-page',
  templateUrl: './feedback-barometer-page.component.html',
  styleUrls: ['./feedback-barometer-page.component.scss']
})
export class FeedbackBarometerPageComponent implements OnInit, AfterContentInit, OnDestroy {

  feedbackLabels = ['sentiment_very_satisfied', 'sentiment_satisfied', 'sentiment_dissatisfied', 'sentiment_very-dissatisfied'];
  surveyLabels = ['survey-a', 'survey-b', 'survey-c', 'survey-d'];

  survey: Survey[] = [];

  isOwner = false;
  user: User;
  roomId: string;
  room: Room;
  protected sub: Subscription;
  isClosed = false;
  isLoading = true;
  type: string;

  constructor(
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private wsFeedbackService: WsFeedbackService,
    private roomService: RoomService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    private liveAnnouncer: LiveAnnouncer) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isOwner) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
        document.getElementById('toggle-button').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true) {
        document.getElementById('reset-button').focus();
      }
    } else {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
        document.getElementById('feedback-button-0').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true) {
        document.getElementById('feedback-button-1').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true) {
        document.getElementById('feedback-button-2').focus();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true) {
        document.getElementById('feedback-button-3').focus();
      }
    }
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announceKeys();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
      this.announceStatus();
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('message-announcer-button');
    }, 700);
  }

  ngOnInit() {
    this.roomId = localStorage.getItem(`roomId`);
    this.translateService.use(localStorage.getItem('currentLang'));
    this.roomService.getRoom(this.roomId).subscribe(room => {
      this.room = room;
      this.isClosed = room.settings['feedbackLocked'];
      if (this.room.extensions && this.room.extensions['feedbackType']) {
        this.type = this.room.extensions['FeedbackType'];
        this.getLabels(this.type === 'SURVEY');
      }
      this.isOwner = this.authenticationService.hasAccess(this.room.shortId, UserRole.CREATOR);
      this.isLoading = false;
    });
    this.user = this.authenticationService.getUser();

    this.sub = this.wsFeedbackService.getFeedbackStream(this.roomId).subscribe((message: Message) => {
      this.parseIncomingMessage(message);
    });
    this.wsFeedbackService.get(this.roomId);
  }

  announce(key: string) {
    this.translateService.get(key).subscribe(msg => {
      this.liveAnnouncer.clear();
      this.liveAnnouncer.announce(msg, 'assertive');
    });
  }

  announceKeys() {
    this.translateService.get('feedback.a11y-keys').subscribe(msg => {
      this.announce(msg);
    });
  }

  announceStatus() {
    this.translateService.get(this.isClosed ? 'feedback.a11y-stopped' : 'feedback.a11y-started').subscribe(status => {
      this.translateService.get('feedback.a11y-status', { status: status, state0: this.survey[0].count, state1: this.survey[1].count,
        state2: this.survey[2].count, state3: this.survey[3].count }).subscribe(msg => {
        this.announce(msg);
      });
    });
  }

  getLabels(isSurvey: boolean) {
    const labels = isSurvey ? this.surveyLabels : this.feedbackLabels;
    for (let i = 0; i < this.surveyLabels.length; i++) {
      const label = labels[i];
      const section = 'feedback.';
      const subsection = 'a11y-';
      this.survey.push(new Survey(i, label, section + label, section + subsection + label, 0));
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

  submitFeedback(state: number) {
    if (!this.isOwner) {
      this.wsFeedbackService.send(this.user.id, state, this.roomId);
    }
  }

  toggle() {
    this.translateService.get(this.isClosed ? 'feedback.a11y-started' : 'feedback.a11y-stopped').subscribe(status => {
      this.translateService.get('feedback.a11y-status-changed', { status: status })
        .subscribe(msg => {
          this.announce(msg);
        });
    });
    if (this.isClosed) {
      this.roomService.changeFeedbackLock(this.roomId, false);
    } else {
      this.roomService.changeFeedbackLock(this.roomId, true);
    }
  }

reset() {
    this.wsFeedbackService.reset(this.roomId);
    this.translateService.get('feedback.has-been-reset').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }

  parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    switch (msg.type) {
      case 'FeedbackChanged':
        this.updateFeedback(payload.values);
        break;
      case 'FeedbackStarted':
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
