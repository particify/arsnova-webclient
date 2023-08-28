import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { BaseDialogComponent } from './_dialogs/base-dialog/base-dialog.component';
import { StepperComponent } from './stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { StatisticContentComponent } from './statistic-content/statistic-content/statistic-content.component';
import { ContentSortAnswerComponent } from './content-answers/content-sort-answer/content-sort-answer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StatisticSortComponent } from './statistic-content/statistic-sort/statistic-sort.component';
import { NavBarComponent } from './bars/nav-bar/nav-bar.component';
import { InfoBarComponent } from './bars/info-bar/info-bar.component';
import { StatisticWordcloudComponent } from './statistic-content/statistic-wordcloud/statistic-wordcloud.component';
import { WordcloudComponent } from './wordcloud/wordcloud.component';
import { StatisticScaleComponent } from './statistic-content/statistic-scale/statistic-scale.component';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { ContentChoiceAnswerComponent } from './content-answers/content-choice-answer/content-choice-answer.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnswerListComponent } from './answer-list/answer-list.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { ContentWordcloudAnswerComponent } from './content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import { DragDropBaseComponent } from './drag-drop-base/drag-drop-base.component';
import { ContentPrioritizationAnswerComponent } from './content-answers/content-prioritization-answer/content-prioritization-answer.component';
import { StatisticPrioritizationComponent } from './statistic-content/statistic-prioritization/statistic-prioritization.component';
import { ContentTextAnswerComponent } from './content-answers/content-text-answer/content-text-answer.component';
import { MultipleRoundSelectionComponent } from './multiple-round-selection/multiple-round-selection.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { DateComponent } from '@app/standalone/date/date.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@NgModule({
  imports: [
    CoreModule,
    RouterModule,
    CdkStepperModule,
    ExtensionPointModule,
    DragDropModule,
    FooterComponent,
    LoadingIndicatorComponent,
    ListBadgeComponent,
    DividerComponent,
    RenderedTextComponent,
    DateComponent,
    AnswerCountComponent,
    LoadingButtonComponent,
  ],
  declarations: [
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    BaseDialogComponent,
    StepperComponent,
    StatisticContentComponent,
    ContentSortAnswerComponent,
    StatisticSortComponent,
    NavBarComponent,
    InfoBarComponent,
    WordcloudComponent,
    ContentChoiceAnswerComponent,
    AnnouncementComponent,
    AnswerListComponent,
    AnnouncementListComponent,
    ContentWordcloudAnswerComponent,
    DragDropBaseComponent,
    ContentPrioritizationAnswerComponent,
    StatisticPrioritizationComponent,
    ContentTextAnswerComponent,
    MultipleRoundSelectionComponent,
  ],
  exports: [
    LoadingIndicatorComponent,
    StepperComponent,
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    StatisticContentComponent,
    ContentSortAnswerComponent,
    StatisticSortComponent,
    NavBarComponent,
    InfoBarComponent,
    DividerComponent,
    WordcloudComponent,
    ContentChoiceAnswerComponent,
    AnnouncementComponent,
    AnswerListComponent,
    ContentWordcloudAnswerComponent,
    ContentPrioritizationAnswerComponent,
    ContentTextAnswerComponent,
    MultipleRoundSelectionComponent,
  ],
})
export class SharedModule {}
