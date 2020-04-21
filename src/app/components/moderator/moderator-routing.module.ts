import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomModeratorPageComponent } from './room-moderator-page/room-moderator-page.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { ModeratorCommentPageComponent } from './moderator-comment-page/moderator-comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { CommentResolver } from '../../resolver/comment.resolver';

const routes: Routes = [
  {
    path: 'room/:shortId',
    component: RoomModeratorPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.EXECUTIVE_MODERATOR] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/comments',
    component: CommentPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.EXECUTIVE_MODERATOR] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/moderator/comments',
    component: ModeratorCommentPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.EXECUTIVE_MODERATOR] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/comment/:commentId',
    component: CommentAnswerComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.EXECUTIVE_MODERATOR] },
    resolve : {
      comment: CommentResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModeratorRoutingModule {
}
