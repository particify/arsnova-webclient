import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { ContentGroupRoutingModule } from './content-group-routing.module';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentListComponent } from './content-list/content-list.component';
import { CreateAnswerOptionComponent } from './content-editing/create-answer-option/create-answer-option.component';
import { PrioritizationContentFormComponent } from './content-editing/prioritization-content-form/prioritization-content-form.component';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { SortContentFormComponent } from './content-editing/sort-content-form/sort-content-form.component';
import { FlashcardContentFormComponent } from './content-editing/flashcard-content-form/flashcard-content-form.component';
import { WordcloudContentFormComponent } from './content-editing/wordcloud-content-form/wordcloud-content-form.component';
import { ChoiceContentFormComponent } from './content-editing/choice-content-form/choice-content-form.component';
import { ContentEditingPageComponent } from './content-editing/content-editing-page.component';
import { ScaleContentFormComponent } from './content-editing/scale-content-form/scale-content-form.component';
import { BinaryContentFormComponent } from './content-editing/binary-content-form/binary-content-form.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
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
import { CreateContentGroupTemplateComponent } from '@app/creator/content-group/_dialogs/create-content-group-template/create-content-group-template.component';
import { ContentGroupTemplateEditingComponent } from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { NumericContentFormComponent } from '@app/creator/content-group/content-editing/numeric-content-form/numeric-content-form.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ContentStepperComponent } from '@app/standalone/content-stepper/content-stepper.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';
import { ShortAnswerContentFormComponent } from '@app/creator/content-group/content-editing/short-answer-content-form/short-answer-content-form.component';

@NgModule({
  declarations: [
    ContentGroupPageComponent,
    ContentListComponent,
    CreateAnswerOptionComponent,
    PrioritizationContentFormComponent,
    SortContentFormComponent,
    FlashcardContentFormComponent,
    WordcloudContentFormComponent,
    ChoiceContentFormComponent,
    ContentEditingPageComponent,
    ScaleContentFormComponent,
    BinaryContentFormComponent,
    ContentPresentationComponent,
    ExportComponent,
    AnswerOptionListComponent,
    CreateContentGroupTemplateComponent,
    NumericContentFormComponent,
    ShortAnswerContentFormComponent,
  ],
  imports: [
    ContentGroupRoutingModule,
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
    ContentGroupInfoComponent,
    CountdownTimerComponent,
    PulsatingCircleComponent,
  ],
})
export class ContentGroupModule {}
