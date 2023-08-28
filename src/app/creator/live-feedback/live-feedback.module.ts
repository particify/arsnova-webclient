import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveFeedbackRoutingModule } from './live-feedback-routing.module';
import { LiveFeedbackPageComponent } from '@app/creator/live-feedback/live-feedback-page.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CoreModule } from '@app/core/core.module';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@NgModule({
  declarations: [LiveFeedbackPageComponent],
  imports: [
    CommonModule,
    CoreModule,
    LiveFeedbackRoutingModule,
    BaseCardComponent,
    LiveFeedbackComponent,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    LoadingButtonComponent,
  ],
})
export class LiveFeedbackModule {}
