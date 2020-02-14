import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomCreatorPageComponent } from './room-creator-page/room-creator-page.component';
import { ContentCreatePageComponent } from './content-create-page/content-create-page.component';
import { StatisticsPageComponent } from '../shared/statistics-page/statistics-page.component';
import { FeedbackBarometerPageComponent } from '../shared/feedback-barometer-page/feedback-barometer-page.component';
import { ContentListComponent } from './content-list/content-list.component';
import { StatisticComponent } from '../shared/statistic/statistic.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

const routes: Routes = [
  {
    path: 'room/:shortId',
    component: RoomCreatorPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/settings',
    component: SettingsPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/create-content',
    component: ContentCreatePageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/statistics',
    component: StatisticsPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/statistics/:contentId',
    component: StatisticComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/comments',
    component: CommentPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/comment/:commentId',
    component: CommentAnswerComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/feedback-barometer',
    component: FeedbackBarometerPageComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/:contentGroup',
    component: ContentListComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  },
  {
    path: 'room/:shortId/:contentGroup/presentation',
    component: ContentPresentationComponent,
    canActivate: [AuthenticationGuard],
    data: { roles: [UserRole.CREATOR] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CreatorRoutingModule {
}
