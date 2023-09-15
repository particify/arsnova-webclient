import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { SeriesPageComponent } from '@app/presentation/series/series-page.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { SeriesRoutingModule } from '@app/presentation/series/series-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { PublishContentComponent } from '@app/presentation/series/_dialogs/publish-content/publish-content.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';

@NgModule({
  declarations: [SeriesPageComponent, PublishContentComponent],
  imports: [
    CoreModule,
    SeriesRoutingModule,
    SharedModule,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
  ],
})
export class SeriesModule {}
