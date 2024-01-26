import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { ContentResultsComponent } from './content-results/content-results.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StatisticSortComponent } from './statistic-content/statistic-sort/statistic-sort.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { StatisticWordcloudComponent } from './statistic-content/statistic-wordcloud/statistic-wordcloud.component';
import { WordcloudComponent } from './wordcloud/wordcloud.component';
import { StatisticScaleComponent } from './statistic-content/statistic-scale/statistic-scale.component';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnswerListComponent } from './answer-list/answer-list.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { DragDropBaseComponent } from './drag-drop-base/drag-drop-base.component';
import { StatisticPrioritizationComponent } from './statistic-content/statistic-prioritization/statistic-prioritization.component';
import { MultipleRoundSelectionComponent } from './multiple-round-selection/multiple-round-selection.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { DateComponent } from '@app/standalone/date/date.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { StatisticNumericComponent } from '@app/shared/statistic-content/statistic-numeric/statistic-numeric.component';
import { StatisticInfoComponent } from '@app/standalone/statistic-info/statistic-info.component';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';

@NgModule({
  imports: [
    CoreModule,
    RouterModule,
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
    StatisticInfoComponent,
    TextOverflowClipComponent,
  ],
  declarations: [
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    ContentResultsComponent,
    StatisticSortComponent,
    NavBarComponent,
    WordcloudComponent,
    AnnouncementComponent,
    AnswerListComponent,
    AnnouncementListComponent,
    DragDropBaseComponent,
    StatisticPrioritizationComponent,
    MultipleRoundSelectionComponent,
    StatisticNumericComponent,
  ],
  exports: [
    LoadingIndicatorComponent,
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    ContentResultsComponent,
    StatisticSortComponent,
    NavBarComponent,
    DividerComponent,
    WordcloudComponent,
    AnnouncementComponent,
    AnswerListComponent,
    MultipleRoundSelectionComponent,
  ],
})
export class SharedModule {}
