import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentListComponent } from './comment-list/comment-list.component';
import { ContentGroupsComponent } from './content-groups/content-groups.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomPageComponent } from './room-page/room-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { CommentPageComponent } from './comment-page/comment-page.component';
import { EssentialsModule } from '../essentials/essentials.module';
import { SharedRoutingModule } from './shared-routing.module';
import { StatisticListComponent } from './statistic-list/statistic-list.component';
import { RoomJoinComponent } from './room-join/room-join.component';
import { RoomCreateComponent } from './_dialogs/room-create/room-create.component';
import { UserBonusTokenComponent } from './_dialogs/user-bonus-token/user-bonus-token.component';
import { CommentComponent, DateFromNow } from './comment/comment.component';
import { CreateCommentComponent } from './_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from './_dialogs/present-comment/present-comment.component';
import { DialogActionButtonsComponent } from './dialog/dialog-action-buttons/dialog-action-buttons.component';
import { MatRippleModule } from '@angular/material/core';
import { ArsModule } from '../../../../projects/ars/src/lib/ars.module';
import { StatisticTextComponent } from './statistic-content/statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-content/statistic-choice/statistic-choice.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { YesNoDialogComponent } from './_dialogs/yes-no-dialog/yes-no-dialog.component';
import { InfoDialogComponent } from './_dialogs/info-dialog/info-dialog.component';
import { RoomNotFoundComponent } from './room-not-found/room-not-found.component';
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
import { PublishContentComponent } from './_dialogs/publish-content/publish-content.component';
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
import { ContentChoiceAnswerComponent } from './content-answers/content-choice-answer/content-choice-answer.component';

@NgModule({
  imports: [
    CommonModule,
    EssentialsModule,
    SharedRoutingModule,
    MatRippleModule,
    ArsModule,
    CdkStepperModule,
    ExtensionPointModule,
    DragDropModule
  ],
  declarations: [
    RoomJoinComponent,
    PageNotFoundComponent,
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
    UserBonusTokenComponent,
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
    InfoDialogComponent,
    RoomNotFoundComponent,
    DateFromNow,
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
    PublishContentComponent,
    WordcloudComponent,
    CommentAnswerComponent,
    SplitShortIdPipe,
    ListBadgeComponent,
    CounterBracesPipe,
    HotkeyDirective,
    HotkeysComponent,
    A11yIntroPipe,
    ContentChoiceAnswerComponent
  ],
  exports: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomPageComponent,
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
    UserBonusTokenComponent,
    LoadingIndicatorComponent,
    RoomNotFoundComponent,
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
    ContentChoiceAnswerComponent
  ]
})
export class SharedModule {
}
