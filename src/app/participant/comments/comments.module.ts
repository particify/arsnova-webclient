import { NgModule } from '@angular/core';

import { CommentsRoutingModule } from './comments-routing.module';
import { CommentsPageComponent } from './comments-page.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CoreModule } from '@app/core/core.module';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { VotingComponent } from '@app/standalone/voting/voting.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';

@NgModule({
  imports: [
    CommentsRoutingModule,
    CoreModule,
    CommentListHintComponent,
    CommentListBarComponent,
    CommentListFloatingButtonsComponent,
    CommentListAddButtonComponent,
    CommentComponent,
    LoadingIndicatorComponent,
    VotingComponent,
    CommentSettingsHintComponent,
    CommentsPageComponent,
  ],
})
export class CommentsModule {}
