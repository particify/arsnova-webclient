import { NgModule } from '@angular/core';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { CommentPageComponent } from './comment-page/comment-page.component';
import { CoreModule } from '@app/core/core.module';
import { CommentComponent } from './comment/comment.component';
import { CreateCommentComponent } from './_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from './present-comment/present-comment.component';
import { DialogActionButtonsComponent } from './dialog/dialog-action-buttons/dialog-action-buttons.component';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { YesNoDialogComponent } from './_dialogs/yes-no-dialog/yes-no-dialog.component';
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
import { CommentAnswerComponent } from './_dialogs/comment-answer/comment-answer.component';
import { StatisticScaleComponent } from './statistic-content/statistic-scale/statistic-scale.component';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { ContentChoiceAnswerComponent } from './content-answers/content-choice-answer/content-choice-answer.component';
import { FormattingToolbarComponent } from './formatting-toolbar/formatting-toolbar.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { DateComponent } from './date/date.component';
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
import { CommentListComponent } from './comment-list/comment-list.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

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
    ContentGroupsComponent,
  ],
  declarations: [
    CommentPageComponent,
    CommentListComponent,
    CommentComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    DialogActionButtonsComponent,
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    YesNoDialogComponent,
    StepperComponent,
    StatisticContentComponent,
    ContentSortAnswerComponent,
    StatisticSortComponent,
    NavBarComponent,
    InfoBarComponent,
    WordcloudComponent,
    CommentAnswerComponent,
    ContentChoiceAnswerComponent,
    FormattingToolbarComponent,
    AnnouncementComponent,
    DateComponent,
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
    CommentPageComponent,
    CommentListComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    CommentComponent,
    DialogActionButtonsComponent,
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
    FormattingToolbarComponent,
    AnnouncementComponent,
    AnswerListComponent,
    ContentWordcloudAnswerComponent,
    ContentPrioritizationAnswerComponent,
    ContentTextAnswerComponent,
    MultipleRoundSelectionComponent,
  ],
})
export class SharedModule {}
