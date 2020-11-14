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
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { LooseContentComponent } from './loose-content/loose-content.component';
import { GroupContentComponent } from './group-content/group-content.component';
import { RoomUserRoleResolver } from '../../resolver/room-user-role.resolver';

const routes: Routes = [
  {
    path: 'room/:shortId',
    canActivate: [AuthenticationGuard],
    data: { requiredRole: UserRole.CREATOR },
    resolve : {
      room: RoomResolver,
      viewRole: RoomViewUserRoleResolver
    },
    children: [
      {
        path: '',
        component: RoomCreatorPageComponent,
        resolve: {
          room: RoomResolver,
          userRole: RoomUserRoleResolver
        }
      },
      {
        path: 'settings',
        component: SettingsPageComponent,
        resolve: {
          room: RoomResolver
        }
      },
      {
        path: 'create-content',
        component: ContentCreationPageComponent
      },
      {
        path: 'group/:contentGroup/statistics/:contentIndex',
        component: ContentPresentationComponent
      },
      {
        path: 'statistics',
        component: StatisticsPageComponent
      },
      {
        path: 'group/:contentGroup/statistics',
        component: ContentPresentationComponent
      },
      {
        path: 'comments',
        component: CommentPageComponent
      },
      {
        path: 'survey',
        component: SurveyPageComponent,
        resolve: {
          room: RoomResolver
        }
      },
      {
        path: 'group/:contentGroup',
        component: GroupContentComponent
      },
      {
        path: 'loosecontent',
        component: LooseContentComponent
      },
      {
        path: 'group/:contentGroup/presentation',
        component: ContentPresentationComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CreatorRoutingModule {
}
