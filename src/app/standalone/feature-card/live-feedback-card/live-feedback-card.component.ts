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

  private destroyed$ = new Subject<void>();

  @Input({ required: true }) room!: Room;
  @Input({ required: true }) description!: string;
  @Input() showCount = false;
  @Input() clickable = false;
  @Input() showControls = false;

  feedbackEnabled = true;
  feedbackAnswers = 0;

  ngOnInit() {
    this.roomSettingsService
      .getByRoomId(this.room.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.feedbackEnabled = settings.surveyEnabled;
      });
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
      });
  }
}
