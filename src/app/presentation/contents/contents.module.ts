import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { SharedModule } from '@app/shared/shared.module';
import { PublishContentComponent } from '@app/presentation/contents/_dialogs/publish-content/publish-content.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentsRoutingModule } from '@app/presentation/contents/contents-routing.module';
import { ContentsPageComponent } from '@app/presentation/contents/contents-page.component';

@NgModule({
  declarations: [ContentsPageComponent, PublishContentComponent],
  imports: [
    CoreModule,
    ContentsRoutingModule,
    SharedModule,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
  ],
})
export class ContentModule {}
