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
import { AnswerEditComponent } from '../creator/_dialogs/answer-edit/answer-edit.component';
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
import { MatRippleModule } from '@angular/material';
import { QrCodeDialogComponent } from './_dialogs/qr-code-dialog/qr-code-dialog.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ArsModule } from '../../../../projects/ars/src/lib/ars.module';
import { CommentAnswerComponent } from './comment-answer/comment-answer.component';
import { MarkdownModule } from 'ngx-markdown';
import { RemoveFromHistoryComponent } from './_dialogs/remove-from-history/remove-from-history.component';

@NgModule({
  imports: [
    CommonModule,
    EssentialsModule,
    ChartsModule,
    SharedRoutingModule,
    MatRippleModule,
    NgxQRCodeModule,
    ArsModule,
    MarkdownModule
  ],
  declarations: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomPageComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    AnswerEditComponent,
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
    QrCodeDialogComponent,
    CommentAnswerComponent,
    RemoveFromHistoryComponent
  ],
  exports: [
    RoomJoinComponent,
    PageNotFoundComponent,
    RoomPageComponent,
    RoomListComponent,
    ContentGroupsComponent,
    HeaderComponent,
    AnswerEditComponent,
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
    UserBonusTokenComponent
  ],
  entryComponents: [
    RoomCreateComponent,
    StatisticHelpComponent,
    CreateCommentComponent,
    PresentCommentComponent,
    DeleteAccountComponent,
    UserBonusTokenComponent,
    RemindOfTokensComponent,
    RemoveFromHistoryComponent
  ]
})
export class SharedModule {
}
