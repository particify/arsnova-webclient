import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentListComponent } from './comment-list/comment-list.component';
import { ContentGroupsComponent } from './content-groups/content-groups.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomOverviewComponent } from './room-overview/room-overview.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { CommentPageComponent } from './comment-page/comment-page.component';
import { EssentialsModule } from '../essentials/essentials.module';
import { SharedRoutingModule } from './shared-routing.module';
import { StatisticListComponent } from './statistic-list/statistic-list.component';
import { RoomJoinComponent } from './room-join/room-join.component';
import { RoomCreateComponent } from './_dialogs/room-create/room-create.component';
import { CommentComponent } from './comment/comment.component';
import { CreateCommentComponent } from './_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from './present-comment/present-comment.component';
import { DialogActionButtonsComponent } from './dialog/dialog-action-buttons/dialog-action-buttons.component';
import { MatRippleModule } from '@angular/material/core';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { YesNoDialogComponent } from './_dialogs/yes-no-dialog/yes-no-dialog.component';
import { StepperComponent } from './stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { RenderedTextComponent } from './rendered-text/rendered-text.component';
import { UpdateInfoComponent } from './_dialogs/update-info/update-info.component';
import { HintComponent } from './hint/hint.component';
import { ExtensionPointModule } from '../../../../projects/extension-point/src/lib/extension-point.module';
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
import { SplitShortIdPipe } from '../../pipes/split-short-id.pipe';
import { ListBadgeComponent } from './list-badge/list-badge.component';
import { CounterBracesPipe } from '../../pipes/counter-braces.pipe';
import { HotkeyDirective } from '../../directives/hotkey.directive';
import { HotkeysComponent } from './_dialogs/hotkeys/hotkeys.component';
import { A11yIntroPipe } from '../../pipes/a11y-intro.pipe';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserFormFieldComponent } from './user-profile/user-form-field/user-form-field.component';
import { ContentChoiceAnswerComponent } from './content-answers/content-choice-answer/content-choice-answer.component';
import { TrackInteractionDirective } from '../../directives/track-interaction.directive';
import { SettingsSlideToggleComponent } from './settings-slide-toggle/settings-slide-toggle.component';
import { RoomPageComponent } from './room-page/room-page.component';
import { FormattingToolbarComponent } from './formatting-toolbar/formatting-toolbar.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { DateFromNowPipe } from '../../pipes/date-from-now.pipe';
import { DateComponent } from './date/date.component';
import { AnswerListComponent } from './answer-list/answer-list.component';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { ContentWordcloudAnswerComponent } from './content-answers/content-wordcloud-answer/content-wordcloud-answer.component';
import { DragDropBaseComponent } from './drag-drop-base/drag-drop-base.component';
import { A11yRenderedBodyPipe } from '../../pipes/a11y-rendered-body.pipe';
import { SettingsPanelHeaderComponent } from './settings-panel-header/settings-panel-header.component';
import { ContentPrioritizationAnswerComponent } from './content-answers/content-prioritization-answer/content-prioritization-answer.component';
import { StatisticPrioritizationComponent } from './statistic-content/statistic-prioritization/statistic-prioritization.component';

@NgModule({
  imports: [
    CommonModule,
    EssentialsModule,
    SharedRoutingModule,
    MatRippleModule,
    CdkStepperModule,
    ExtensionPointModule,
    DragDropModule,
  ],
  declarations: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomOverviewComponent,
    RoomPageComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    SurveyPageComponent,
    FooterComponent,
    CommentPageComponent,
    CommentListComponent,
    StatisticsPageComponent,
    StatisticListComponent,
    RoomCreateComponent,
    CommentComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    DialogActionButtonsComponent,
    StatisticChoiceComponent,
    StatisticScaleComponent,
    StatisticTextComponent,
    StatisticWordcloudComponent,
    LoadingIndicatorComponent,
    YesNoDialogComponent,
    StepperComponent,
    RenderedTextComponent,
    UpdateInfoComponent,
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
    SplitShortIdPipe,
    ListBadgeComponent,
    CounterBracesPipe,
    HotkeyDirective,
    HotkeysComponent,
    A11yIntroPipe,
    UserProfileComponent,
    UserFormFieldComponent,
    ContentChoiceAnswerComponent,
    TrackInteractionDirective,
    SettingsSlideToggleComponent,
    FormattingToolbarComponent,
    AnnouncementComponent,
    DateFromNowPipe,
    DateFormatPipe,
    DateComponent,
    AnswerListComponent,
    AnnouncementListComponent,
    ContentWordcloudAnswerComponent,
    DragDropBaseComponent,
    A11yRenderedBodyPipe,
    SettingsPanelHeaderComponent,
    ContentPrioritizationAnswerComponent,
    StatisticPrioritizationComponent,
  ],
  exports: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomOverviewComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    SurveyPageComponent,
    FooterComponent,
    CommentPageComponent,
    CommentListComponent,
    StatisticsPageComponent,
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
    SplitShortIdPipe,
    HotkeyDirective,
    HotkeysComponent,
    A11yIntroPipe,
    CounterBracesPipe,
    ContentChoiceAnswerComponent,
    TrackInteractionDirective,
    SettingsSlideToggleComponent,
    FormattingToolbarComponent,
    AnnouncementComponent,
    AnswerListComponent,
    ContentWordcloudAnswerComponent,
    A11yRenderedBodyPipe,
    SettingsPanelHeaderComponent,
    ContentPrioritizationAnswerComponent,
  ],
})
export class SharedModule {}
