import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { SharedModule } from '@app/shared/shared.module';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentsRoutingModule } from '@app/presentation/contents/contents-routing.module';
import { ContentsPageComponent } from '@app/presentation/contents/contents-page.component';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';

@NgModule({
  declarations: [ContentsPageComponent],
  imports: [
    CoreModule,
    ContentsRoutingModule,
    SharedModule,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
    AttributionsInfoComponent,
    HotkeyActionButtonComponent,
  ],
})
export class ContentModule {}
