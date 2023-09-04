import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractLiveFeedbackPage } from '@app/common/abstract/abstract-live-feedback-page';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { RoomService } from '@app/core/services/http/room.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { TranslocoService } from '@ngneat/transloco';
import { Message } from '@stomp/stompjs';

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
})
export class LiveFeedbackPageComponent
  extends AbstractLiveFeedbackPage
  implements OnInit, OnDestroy
{
  userId: string;
  voteKeys = ['1', '2', '3', '4'];

  constructor(
    protected wsFeedbackService: WsFeedbackService,
    protected feedbackService: FeedbackService,
    protected roomService: RoomService,
    protected translateService: TranslocoService,
    protected announceService: AnnounceService,
    protected globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    protected authenticationService: AuthenticationService
  ) {
    super(
      wsFeedbackService,
      feedbackService,
      roomService,
      translateService,
      announceService,
      globalStorageService,
      route
    );
  }

  ngOnInit() {
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.userId = auth.userId));
    this.initData();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  submitAnswer(state: number) {
    this.wsFeedbackService.send(this.userId, state, this.room.id);
    this.announceAnswer(
      this.type === LiveFeedbackType.FEEDBACK
        ? this.feedbackLabels[state].toString()
        : this.surveyLabels[state].toString()
    );
  }

  private announceAnswer(label: string) {
    const answer = this.translateService.translate(
      'participant.survey.' + label
    );
    const msg = this.translateService.translate(
      'participant.survey.a11y-selected-answer',
      {
        answer: answer,
      }
    );
    this.announceService.announce(msg);
  }

  protected parseIncomingMessage(message: Message) {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    const type = msg.type;
    if (type === FeedbackMessageType.CHANGED) {
      this.updateFeedback(payload.values);
    } else {
      this.roomService.getRoom(this.room.id).subscribe((room) => {
        this.loadConfig(room);
      });
      this.isClosed = type === FeedbackMessageType.STOPPED;
      if (this.isClosed) {
        this.updateFeedback([0, 0, 0, 0]);
      }
    }
  }
}
