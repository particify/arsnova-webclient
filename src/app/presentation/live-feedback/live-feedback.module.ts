import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveFeedbackRoutingModule } from './live-feedback-routing.module';
import { LiveFeedbackPageComponent } from '@app/presentation/live-feedback/live-feedback-page.component';
import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { CoreModule } from '@app/core/core.module';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';

@NgModule({
  declarations: [LiveFeedbackPageComponent],
  imports: [
    CommonModule,
    CoreModule,
    LiveFeedbackRoutingModule,
    LiveFeedbackComponent,
    LoadingIndicatorComponent,
    AnswerCountComponent,
  ],
})
export class LiveFeedbackModule {}
