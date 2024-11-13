import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractLiveFeedbackPageComponent } from '@app/common/abstract/abstract-live-feedback-page';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { RoomService } from '@app/core/services/http/room.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import {
  TranslocoService,
  TranslocoPipe,
  provideTranslocoScope,
} from '@jsverse/transloco';
import { Message } from '@stomp/stompjs';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { FlexModule } from '@angular/flex-layout';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { CoreModule } from '@app/core/core.module';

function setDefaultTrue(value: boolean | undefined): boolean {
  return value ?? true;
}

@Component({
  selector: 'app-live-feedback-page',
  templateUrl: './live-feedback-page.component.html',
  styleUrls: ['./live-feedback-page.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    BaseCardComponent,
    LiveFeedbackComponent,
    FlexModule,
    AnswerCountComponent,
    NgClass,
    MatButton,
    MatIcon,
    MatTooltip,
    AsyncPipe,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('participant')],
})
export class LiveFeedbackPageComponent
  extends AbstractLiveFeedbackPageComponent
  implements OnInit, OnDestroy
{
  // Route data input below
  @Input({
    transform: setDefaultTrue,
  })
  showCard!: boolean;

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  userId!: string;
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
      globalStorageService
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
    switch (type) {
      case FeedbackMessageType.CHANGED:
        this.updateFeedback(payload.values);
        break;
      case FeedbackMessageType.RESET:
        this.updateFeedback([0, 0, 0, 0]);
        break;
      case FeedbackMessageType.STARTED:
        this.roomService.getRoom(this.room.id).subscribe((room) => {
          this.type = this.feedbackService.getType(room);
          this.isClosed = false;
        });
        break;
      default:
        this.isClosed = true;
    }
  }
}
