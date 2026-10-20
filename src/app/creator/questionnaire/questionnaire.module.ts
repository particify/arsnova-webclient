import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { ContentListComponent } from './content-list/content-list.component';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { ChoiceContentFormComponent } from './content-editing/choice-content-form/choice-content-form.component';
import { ContentEditingComponent } from './content-editing/content-editing.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslocoModule } from '@jsverse/transloco';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { ExportComponent } from './_dialogs/export/export.component';
import { AnswerOptionListComponent } from './content-editing/answer-option-list/answer-option-list.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CreateContentGroupTemplateComponent } from '@app/creator/questionnaire/_dialogs/create-content-group-template/create-content-group-template.component';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ContentStepperComponent } from '@app/standalone/content-stepper/content-stepper.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';
import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import { QuestionnairePageService } from './questionnaire-page.service';
import { QuestionnaireRoutingModule } from './questionnaire-routing.module';

@NgModule({
  imports: [
    QuestionnaireRoutingModule,
    ExtensionPointModule,
    CoreModule,
    ContentResultsComponent,
    DragDropModule,
    TranslocoModule,
    CdkStepperModule,
    StepperComponent,
    ExtensionPointModule,
    HintComponent,
    DividerComponent,
    RenderedTextComponent,
    AnswerCountComponent,
    FormattingToolbarComponent,
    LoadingButtonComponent,
    BaseCardComponent,
    ContentGroupTemplateEditingComponent,
    ContentPreviewComponent,
    AttributionsInfoComponent,
    LeaderboardComponent,
    LoadingIndicatorComponent,
    ContentStepperComponent,
    FlexLayoutModule,
    CountdownTimerComponent,
    PulsatingCircleComponent,
    ContentGroupLeaderboardComponent,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    BackButtonComponent,
    ContentListComponent,
    ChoiceContentFormComponent,
    ContentEditingComponent,
    ExportComponent,
    AnswerOptionListComponent,
    CreateContentGroupTemplateComponent,
  ],
  providers: [QuestionnairePageService],
})
export class QuestionnaireModule {}
