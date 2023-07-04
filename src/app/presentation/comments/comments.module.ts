import { NgModule } from '@angular/core';

import { CommentsRoutingModule } from './comments-routing.module';
import { CommentsPageComponent } from './comments-page.component';
import { CoreModule } from '@app/core/core.module';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { PresentCommentComponent } from '@app/presentation/comments/present-comment/present-comment.component';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';

@NgModule({
  declarations: [CommentsPageComponent, PresentCommentComponent],
  imports: [
    CommentsRoutingModule,
    CoreModule,
    CommentComponent,
    LoadingIndicatorComponent,
    CommentListHintComponent,
    CommentSettingsHintComponent,
  ],
})
export class CommentsModule {}
