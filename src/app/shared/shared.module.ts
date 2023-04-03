import { NgModule } from '@angular/core';
import { ContentGroupsComponent } from './content-groups/content-groups.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { RoomOverviewComponent } from './room-overview/room-overview.component';
import { CommentPageComponent } from './comment-page/comment-page.component';
import { CoreModule } from '@app/core/core.module';
import { RoomCreateComponent } from './_dialogs/room-create/room-create.component';
import { CommentComponent } from './comment/comment.component';
import { CreateCommentComponent } from './_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from './present-comment/present-comment.component';
import { DialogActionButtonsComponent } from './dialog/dialog-action-buttons/dialog-action-buttons.component';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from './_standalone/loading-indicator/loading-indicator.component';
import { YesNoDialogComponent } from './_dialogs/yes-no-dialog/yes-no-dialog.component';
import { StepperComponent } from './stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { RenderedTextComponent } from './rendered-text/rendered-text.component';
import { HintComponent } from './hint/hint.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { AnswerCountComponent } from './answer-count/answer-count.component';
import { StatisticContentComponent } from './statistic-content/statistic-content/statistic-content.component';
import { ContentSortAnswerComponent } from './content-answers/content-sort-answer/content-sort-answer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StatisticSortComponent } from './statistic-content/statistic-sort/statistic-sort.component';
import { NavBarComponent } from './bars/nav-bar/nav-bar.component';
import { InfoBarComponent } from './bars/info-bar/info-bar.component';
import { DividerComponent } from './divider/divider.component';
import { StatisticWordcloudComponent } from './statistic-content/statistic-wordcloud/statistic-wordcloud.component';
import { WordcloudComponent } from './wordcloud/wordcloud.component';
import { CommentAnswerComponent } from './_dialogs/comment-answer/comment-answer.component';
import { StatisticScaleComponent } from './statistic-content/statistic-scale/statistic-scale.component';
import { ListBadgeComponent } from './list-badge/list-badge.component';
import { ContentChoiceAnswerComponent } from './content-answers/content-choice-answer/content-choice-answer.component';
import { RoomPageComponent } from './room-page/room-page.component';
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
import { FooterComponent } from '@app/shared/_standalone/footer/footer.component';
import { CommentListComponent } from './comment-list/comment-list.component';

@NgModule({
  imports: [
    CoreModule,
    RouterModule,
    CdkStepperModule,
    ExtensionPointModule,
    DragDropModule,
    FooterComponent,
    LoadingIndicatorComponent,
  ],
  declarations: [
    RoomOverviewComponent,
    RoomPageComponent,
    ContentGroupsComponent,
    SurveyPageComponent,
    CommentPageComponent,
    CommentListComponent,
    RoomCreateComponent,
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
    RenderedTextComponent,
    HintComponent,
    AnswerCountComponent,
    StatisticContentComponent,
    ContentSortAnswerComponent,
    StatisticSortComponent,
    NavBarComponent,
    InfoBarComponent,
    DividerComponent,
    WordcloudComponent,
    CommentAnswerComponent,
    ListBadgeComponent,
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
    RoomOverviewComponent,
    ContentGroupsComponent,
    SurveyPageComponent,
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
    RenderedTextComponent,
    HintComponent,
    StatisticContentComponent,
    HintComponent,
    ContentSortAnswerComponent,
    StatisticSortComponent,
    NavBarComponent,
    InfoBarComponent,
    DividerComponent,
    AnswerCountComponent,
    WordcloudComponent,
    ContentChoiceAnswerComponent,
    FormattingToolbarComponent,
    AnnouncementComponent,
    AnswerListComponent,
    ContentWordcloudAnswerComponent,
    ContentPrioritizationAnswerComponent,
    ContentTextAnswerComponent,
    MultipleRoundSelectionComponent,
    LoadingIndicatorComponent,
  ],
})
export class SharedModule {}
