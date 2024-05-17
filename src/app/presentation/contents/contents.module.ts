import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentsRoutingModule } from '@app/presentation/contents/contents-routing.module';
import { ContentsPageComponent } from '@app/presentation/contents/contents-page.component';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { LeaderboardPageComponent } from '@app/presentation/contents/leaderboard-page/leaderboard-page.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';

@NgModule({
  declarations: [ContentsPageComponent, LeaderboardPageComponent],
  imports: [
    CoreModule,
    ContentsRoutingModule,
    ContentResultsComponent,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
    AttributionsInfoComponent,
    HotkeyActionButtonComponent,
    CountdownTimerComponent,
    ContentWaitingComponent,
    LeaderboardComponent,
    ContentStepInfoComponent,
  ],
})
export class ContentModule {}
