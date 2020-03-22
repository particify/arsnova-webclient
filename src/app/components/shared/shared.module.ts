import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentListComponent } from './comment-list/comment-list.component';
import { ContentGroupsComponent } from './content-groups/content-groups.component';
import { FeedbackBarometerPageComponent } from './feedback-barometer-page/feedback-barometer-page.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomPageComponent } from './room-page/room-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { ContentDeleteComponent } from '../creator/_dialogs/content-delete/content-delete.component';
import { CommentPageComponent } from './comment-page/comment-page.component';
import { EssentialsModule } from '../essentials/essentials.module';
import { SharedRoutingModule } from './shared-routing.module';
import { StatisticListComponent } from './statistic-list/statistic-list.component';
import { ChartsModule } from 'ng2-charts';
import { StatisticComponent } from './statistic/statistic.component';
import { RoomJoinComponent } from './room-join/room-join.component';
import { RoomCreateComponent } from './_dialogs/room-create/room-create.component';
import { UserBonusTokenComponent } from './_dialogs/user-bonus-token/user-bonus-token.component';
import { RemindOfTokensComponent } from './_dialogs/remind-of-tokens/remind-of-tokens.component';
import { StatisticHelpComponent } from './_dialogs/statistic-help/statistic-help.component';
import { CommentComponent } from './comment/comment.component';
import { CreateCommentComponent } from './_dialogs/create-comment/create-comment.component';
import { PresentCommentComponent } from './_dialogs/present-comment/present-comment.component';
import { DeleteAccountComponent } from './_dialogs/delete-account/delete-account.component';
import { DialogActionButtonsComponent } from './dialog/dialog-action-buttons/dialog-action-buttons.component';
import { MatRippleModule } from '@angular/material/core';
import { ArsModule } from '../../../../projects/ars/src/lib/ars.module';
import { CommentAnswerComponent } from './comment-answer/comment-answer.component';
import { MarkdownModule } from 'ngx-markdown';
import { RemoveFromHistoryComponent } from './_dialogs/remove-from-history/remove-from-history.component';
import { StatisticTextComponent } from './statistic-text/statistic-text.component';
import { StatisticChoiceComponent } from './statistic-choice/statistic-choice.component';
import { QrCodeComponent } from './_dialogs/qr-code/qr-code.component';
import { QRCodeModule } from 'angularx-qrcode';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { YesNoDialogComponent } from './_dialogs/yes-no-dialog/yes-no-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    EssentialsModule,
    ChartsModule,
    SharedRoutingModule,
    MatRippleModule,
    ArsModule,
    MarkdownModule,
    QRCodeModule
  ],
  declarations: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomPageComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    ContentDeleteComponent,
    FeedbackBarometerPageComponent,
    FooterComponent,
    CommentPageComponent,
    CommentListComponent,
    StatisticsPageComponent,
    StatisticListComponent,
    StatisticComponent,
    RoomCreateComponent,
    UserBonusTokenComponent,
    RemindOfTokensComponent,
    StatisticHelpComponent,
    CommentComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    DeleteAccountComponent,
    DialogActionButtonsComponent,
    CommentAnswerComponent,
    RemoveFromHistoryComponent,
    QrCodeComponent,
    StatisticChoiceComponent,
    StatisticTextComponent,
    LoadingIndicatorComponent,
    YesNoDialogComponent
  ],
  exports: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomPageComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    ContentDeleteComponent,
    FeedbackBarometerPageComponent,
    FooterComponent,
    CommentPageComponent,
    CommentListComponent,
    StatisticsPageComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    CommentComponent,
    DialogActionButtonsComponent,
    UserBonusTokenComponent,
    LoadingIndicatorComponent
  ],
  entryComponents: [
    RoomCreateComponent,
    StatisticHelpComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    DeleteAccountComponent,
    UserBonusTokenComponent,
    RemindOfTokensComponent,
    RemoveFromHistoryComponent,
    QrCodeComponent
  ]
})
export class SharedModule {
}
