import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { SharedModule } from '@app/shared/shared.module';
import { PublishContentComponent } from '@app/presentation/content-group/_dialogs/publish-content/publish-content.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentGroupRoutingModule } from '@app/presentation/content-group/content-group-routing.module';
import { ContentGroupPageComponent } from '@app/presentation/content-group/content-group-page.component';

@NgModule({
  declarations: [ContentGroupPageComponent, PublishContentComponent],
  imports: [
    CoreModule,
    ContentGroupRoutingModule,
    SharedModule,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
  ],
})
export class ContentGroupModule {}
