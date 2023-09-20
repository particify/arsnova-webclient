import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { ContentGroupRoutingModule } from './content-group-routing.module';
import { ContentGroupPageComponent } from './content-group-page.component';
import { ContentListComponent } from './content-list/content-list.component';
import { CreateAnswerOptionComponent } from './content-editing/create-answer-option/create-answer-option.component';
import { PrioritizationContentFormComponent } from './content-editing/prioritization-content-form/prioritization-content-form.component';
import { StatisticListComponent } from './statistic-list/statistic-list.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { PreviewComponent } from './content-editing/preview/preview.component';
import { SortContentFormComponent } from './content-editing/sort-content-form/sort-content-form.component';
import { FlashcardContentFormComponent } from './content-editing/flashcard-content-form/flashcard-content-form.component';
import { WordcloudContentFormComponent } from './content-editing/wordcloud-content-form/wordcloud-content-form.component';
import { ChoiceContentFormComponent } from './content-editing/choice-content-form/choice-content-form.component';
import { ContentEditingPageComponent } from './content-editing/content-editing-page/content-editing-page.component';
import { ScaleContentFormComponent } from './content-editing/scale-content-form/scale-content-form.component';
import { BinaryContentFormComponent } from './content-editing/binary-content-form/binary-content-form.component';
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
import { AnswerOptionListComponent } from './content-editing/answer-option-list/answer-option-list.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';

@NgModule({
  declarations: [
    ContentGroupPageComponent,
    ContentListComponent,
    CreateAnswerOptionComponent,
    PrioritizationContentFormComponent,
    StatisticListComponent,
    StatisticsPageComponent,
    PreviewComponent,
    SortContentFormComponent,
    FlashcardContentFormComponent,
    WordcloudContentFormComponent,
    ChoiceContentFormComponent,
    ContentEditingPageComponent,
    ScaleContentFormComponent,
    BinaryContentFormComponent,
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
