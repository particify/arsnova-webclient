import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRole } from '../../models/user-roles.enum';
import { RoomParticipantPageComponent } from './room-participant-page/room-participant-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { StatisticsPageComponent } from '../shared/statistics-page/statistics-page.component';
import { StatisticComponent } from '../shared/statistic/statistic.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { CommentResolver } from '../../resolver/comment.resolver';
import { ContentResolver } from '../../resolver/content.resolver';

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
    path: 'room/:shortId/statistics',
    component: StatisticsPageComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      room: RoomResolver
    }
  },
  {
    path: 'room/:shortId/statistics/:contentId',
    component: StatisticComponent,
    data: { roles: [UserRole.PARTICIPANT] },
    resolve : {
      content: ContentResolver
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParticipantRoutingModule {
}
