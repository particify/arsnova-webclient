import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRole } from '../../models/user-roles.enum';
import { RoomParticipantPageComponent } from './room-participant-page/room-participant-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { StatisticComponent } from '../shared/statistic/statistic.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { CommentResolver } from '../../resolver/comment.resolver';
import { AuthenticationGuard } from '../../guards/authentication.guard';

const routes: Routes = [
  {
    path: 'room/:shortId',
    component: RoomParticipantPageComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/statistics',
    component: StatisticComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/statistics/:contentIndex',
    component: StatisticComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/comments',
    component: CommentPageComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/comment/:commentId',
    component: CommentAnswerComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      comment: CommentResolver
    }
  },
  {
    path: 'room/:shortId/survey',
    component: SurveyPageComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup',
    component: ParticipantContentCarouselPageComponent,
    data: { roles: [UserRole.PARTICIPANT] }
  },
  {
    path: 'room/:shortId/group/:contentGroup/:contentIndex',
    component: ParticipantContentCarouselPageComponent,
    data: { roles: [UserRole.PARTICIPANT] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParticipantRoutingModule {
}
