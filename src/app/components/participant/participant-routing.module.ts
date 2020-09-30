import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRole } from '../../models/user-roles.enum';
import { RoomParticipantPageComponent } from './room-participant-page/room-participant-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { CommentResolver } from '../../resolver/comment.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { RoomUserRoleResolver } from '../../resolver/room-user-role.resolver';

const routes: Routes = [
  {
    path: 'room/:shortId',
    component: RoomParticipantPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver,
      userRole: RoomUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/comments',
    component: CommentPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/comment/:commentId',
    component: CommentAnswerComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      comment: CommentResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/survey',
    component: SurveyPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup',
    component: ParticipantContentCarouselPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/:contentIndex',
    component: ParticipantContentCarouselPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.PARTICIPANT },
    resolve : {
      viewRole: RoomViewUserRoleResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParticipantRoutingModule {
}
