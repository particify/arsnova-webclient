import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { ContentGroupRoutingModule } from './content-group-routing.module';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentListComponent } from './content-list/content-list.component';
import { CreateAnswerOptionComponent } from './content-creation/create-answer-option/create-answer-option.component';
import { ContentPrioritizationCreationComponent } from './content-creation/content-prioritization-creation/content-prioritization-creation.component';
import { StatisticListComponent } from './statistic-list/statistic-list.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { PreviewComponent } from './content-creation/preview/preview.component';
import { ContentSortCreationComponent } from './content-creation/content-sort-creation/content-sort-creation.component';
import { ContentFlashcardCreationComponent } from './content-creation/content-flashcard-creation/content-flashcard-creation.component';
import { ContentWordcloudCreationComponent } from './content-creation/content-wordcloud-creation/content-wordcloud-creation.component';
import { ContentChoiceCreationComponent } from './content-creation/content-choice-creation/content-choice-creation.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { ContentScaleCreationComponent } from './content-creation/content-scale-creation/content-scale-creation.component';
import { ContentYesNoCreationComponent } from './content-creation/content-yes-no-creation/content-yes-no-creation.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { SharedModule } from '@app/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslocoModule } from '@ngneat/transloco';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { ContentGroupTitleComponent } from './content-group-title/content-group-title.component';
import { ContentListSortComponent } from './content-list-sort/content-list-sort.component';
import { ExportComponent } from './_dialogs/export/export.component';
import { AnswerOptionListComponent } from './content-creation/answer-option-list/answer-option-list.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';

@NgModule({
  declarations: [
    ContentGroupPageComponent,
    ContentListComponent,
    CreateAnswerOptionComponent,
    ContentPrioritizationCreationComponent,
    StatisticListComponent,
    StatisticsPageComponent,
    PreviewComponent,
    ContentSortCreationComponent,
    ContentFlashcardCreationComponent,
    ContentWordcloudCreationComponent,
    ContentChoiceCreationComponent,
    ContentCreationPageComponent,
    ContentScaleCreationComponent,
    ContentYesNoCreationComponent,
    ContentPresentationComponent,
    ContentGroupTitleComponent,
    ContentListSortComponent,
    ExportComponent,
    AnswerOptionListComponent,
  ],
  imports: [
    ContentGroupRoutingModule,
    ExtensionPointModule,
    CoreModule,
    SharedModule,
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
  ],
})
export class ContentGroupModule {}
