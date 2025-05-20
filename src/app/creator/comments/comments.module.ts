import { NgModule } from '@angular/core';

import { CommentsRoutingModule } from './comments-routing.module';
import { CommentsPageComponent } from '@app/creator/comments/comments-page.component';
import { CoreModule } from '@app/core/core.module';
import { CommentListHintComponent } from '@app/standalone/comment-list-hint/comment-list-hint.component';
import { CommentListBarComponent } from '@app/standalone/comment-list-bar/comment-list-bar.component';
import { CommentListBarExtensionComponent } from './comment-list-bar-extension/comment-list-bar-extension.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { CommentSettingsHintComponent } from '@app/standalone/comment-settings-hint/comment-settings-hint.component';
import { CommentListFloatingButtonsComponent } from '@app/standalone/comment-list-floating-buttons/comment-list-floating-buttons.component';
import { CommentListAddButtonComponent } from '@app/standalone/comment-list-add-button/comment-list-add-button.component';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

@NgModule({
  imports: [
    CommentsRoutingModule,
    ExtensionPointModule,
    CoreModule,
    CommentListHintComponent,
    CommentListBarComponent,
    CommentSettingsHintComponent,
    CommentListFloatingButtonsComponent,
    CommentListAddButtonComponent,
    CommentComponent,
    LoadingIndicatorComponent,
    CommentsPageComponent,
    CommentListBarExtensionComponent,
  ],
})
export class CommentsModule {}
