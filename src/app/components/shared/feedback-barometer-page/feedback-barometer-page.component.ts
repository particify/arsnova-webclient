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

@Component({
  selector: 'app-feedback-barometer-page',
  templateUrl: './feedback-barometer-page.component.html',
  styleUrls: ['./feedback-barometer-page.component.scss']
})
export class FeedbackBarometerPageComponent implements OnInit, AfterContentInit, OnDestroy {

  feedback = [
    { state: 0, name: 'sentiment_very_satisfied', label: 'feedback.very-satisfied', a11y: 'feedback.a11y-very-satisfied', count: 0 },
    { state: 1, name: 'sentiment_satisfied', label: 'feedback.satisfied', a11y: 'feedback.a11y-satisfied', count: 0 },
    { state: 2, name: 'sentiment_dissatisfied', label: 'feedback.dissatisfied', a11y: 'feedback.a11y-dissatisfied', count: 0 },
    { state: 3, name: 'sentiment_very_dissatisfied', label: 'feedback.very-dissatisfied', a11y: 'feedback.a11y-very-dissatisfied',
      count: 0 }
  ];
  isOwner = false;
  user: User;
  roomId: string;
  room: Room;
  protected sub: Subscription;
  isClosed = false;
  isLoading = true;

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
      this.translateService.get('feedback.a11y-status', { status: status, state0: this.feedback[0].count, state1: this.feedback[1].count,
        state2: this.feedback[2].count, state3: this.feedback[3].count }).subscribe(msg => {
        this.announce(msg);
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private updateFeedback(data) {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const sum = data.reduce(reducer);
    for (let i = 0; i < this.feedback.length; i++) {
      this.feedback[i].count = data[i] / sum * 100;
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
