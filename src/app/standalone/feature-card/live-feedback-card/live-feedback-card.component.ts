import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { FeedbackMessageType } from '@app/core/models/messages/feedback-message-type';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { DisabledIfReadonlyDirective } from '@app/core/directives/disabled-if-readonly.directive';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';

@Component({
  selector: 'app-live-feedback-card',
  imports: [
    FeatureCardComponent,
    TranslocoPipe,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    FlexModule,
    DisabledIfReadonlyDirective,
  ],
  templateUrl: './live-feedback-card.component.html',
})
export class LiveFeedbackCardComponent implements OnDestroy, OnInit {
  private roomSettingsService = inject(RoomSettingsService);
  private feedbackService = inject(FeedbackService);
  protected wsFeedbackService = inject(WsFeedbackService);

  private destroyed$ = new Subject<void>();

  @Input({ required: true }) room!: Room;
  @Input({ required: true }) description!: string;
  @Input() showCount = false;
  @Input() clickable = false;
  @Input() showControls = false;
  @Input() feedbackEnabled?: boolean;

  feedbackAnswers = 0;

  ngOnInit() {
    if (this.feedbackEnabled === undefined) {
      this.roomSettingsService
        .getByRoomId(this.room.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((settings) => {
          this.feedbackEnabled = settings.surveyEnabled;
        });
    }
    this.feedbackService.get(this.room.id).subscribe((values) => {
      this.determineFeedbackAnswerCount(values);
    });
    if (this.showCount) {
      this.feedbackService.startSub(this.room.id);
      this.feedbackService
        .getMessages()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((message) => {
          const msg = JSON.parse(message.body);
          if (msg.type === FeedbackMessageType.CHANGED) {
            this.determineFeedbackAnswerCount(msg.payload.values);
          } else if (msg.type === FeedbackMessageType.RESET) {
            this.feedbackAnswers = 0;
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private determineFeedbackAnswerCount(values: number[]) {
    this.feedbackAnswers = values.reduce((a, b) => a + b, 0);
  }

  toggleLiveFeedbackFeature() {
    this.roomSettingsService
      .updateSurveyEnabled(this.room.id, !this.feedbackEnabled)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.feedbackEnabled = settings.surveyEnabled;
        if (!this.feedbackEnabled) {
          this.wsFeedbackService.reset(this.room.id);
        }
      });
  }
}
