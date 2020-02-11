import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-feedback-barometer-page',
  templateUrl: './feedback-barometer-page.component.html',
  styleUrls: ['./feedback-barometer-page.component.scss']
})
export class FeedbackBarometerPageComponent implements OnInit, OnDestroy {

  feedback = [
    { state: 0, name: 'sentiment_very_satisfied', count: 0 },
    { state: 1, name: 'sentiment_satisfied', count: 0 },
    { state: 2, name: 'sentiment_dissatisfied', count: 0 },
    { state: 3, name: 'sentiment_very_dissatisfied', count: 0 }
  ];
  isOwner = false;
  user: User;
  roomId: string;
  room: Room;
  protected sub: Subscription;
  isClosed = false;
  isLoading = true;
  fieldNames = ['feedback.very-satisfied', 'feedback.satisfied', 'feedback.dissatisfied', 'feedback.very-dissatisfied'];

  constructor(
    private authenticationService: AuthenticationService,
    private notification: NotificationService,
    private wsFeedbackService: WsFeedbackService,
    private roomService: RoomService,
    protected translateService: TranslateService,
    protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
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
    this.wsFeedbackService.send(this.user.id, state, this.roomId);
  }

  toggle() {
    if (this.isClosed) {
      this.roomService.changeFeedbackLock(this.roomId, false);
    } else {
      this.roomService.changeFeedbackLock(this.roomId, true);
    }
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
    }
  }
}
