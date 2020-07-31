import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomCreatorPageComponent } from './room-creator-page/room-creator-page.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from '../shared/statistics-page/statistics-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { CommentAnswerComponent } from '../shared/comment-answer/comment-answer.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { CommentResolver } from '../../resolver/comment.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { LooseContentComponent } from './loose-content/loose-content.component';
import { GroupContentComponent } from './group-content/group-content.component';

const routes: Routes = [
  {
    path: 'room/:shortId',
    component: RoomCreatorPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/settings',
    component: SettingsPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/create-content',
    component: ContentCreationPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/statistics/:contentIndex',
    component: ContentPresentationComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/statistics',
    component: StatisticsPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/statistics',
    component: ContentPresentationComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/comments',
    component: CommentPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/comment/:commentId',
    component: CommentAnswerComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      comment: CommentResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/survey',
    component: SurveyPageComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup',
    component: GroupContentComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/loosecontent',
    component: LooseContentComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  },
  {
    path: 'room/:shortId/group/:contentGroup/presentation',
    component: ContentPresentationComponent,
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CreatorRoutingModule {
}
