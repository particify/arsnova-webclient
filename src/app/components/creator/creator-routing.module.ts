import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '../../../../projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomPageComponent } from '../shared/room-page/room-page.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from '../shared/statistics-page/statistics-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { GroupContentComponent } from './content-list/group-content/group-content.component';
import { RoomUserRoleResolver } from '../../resolver/room-user-role.resolver';
import { CreatorOverviewComponent } from './creator-overview/creator-overview.component';

const routes: Routes = [
  {
    path: 'group',
    redirectTo: 'series',
  },
  {
    path: 'survey',
    redirectTo: 'feedback',
  },
  {
    path: '',
    component: CreatorOverviewComponent,
  },
  {
    path: 'settings',
    component: SettingsPageComponent,
  },
  {
    path: 'settings/:settingsName',
    component: SettingsPageComponent,
  },
  {
    path: 'series/:seriesName/create',
    component: ContentCreationPageComponent,
  },
  {
    path: 'series/:seriesName/edit/:contentId',
    component: ContentCreationPageComponent,
    data: {
      isEditMode: true,
    },
  },
  {
    path: 'series/:seriesName/statistics',
    component: StatisticsPageComponent,
  },
  {
    path: 'series/:seriesName/:contentIndex',
    component: ContentPresentationComponent,
  },
  {
    path: 'comments',
    component: CommentPageComponent,
  },
  {
    path: 'comments/moderation',
    component: CommentPageComponent,
    data: {
      isModeration: true,
    },
  },
  {
    path: 'feedback',
    component: SurveyPageComponent,
  },
  {
    path: 'series/:seriesName',
    component: GroupContentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild([])],
  exports: [RouterModule],
  providers: [
    {
      provide: ROUTES,
      useFactory: (extensionRouteProviders: ExtensionRouteProvider[]) => [
        {
          path: 'room/:shortId',
          redirectTo: ':shortId',
        },
        {
          path: ':shortId',
          component: RoomPageComponent,
          canActivate: [AuthenticationGuard],
          data: { requiredRole: UserRole.EXECUTIVE_MODERATOR },
          resolve: {
            room: RoomResolver,
            viewRole: RoomViewUserRoleResolver,
            userRole: RoomUserRoleResolver,
          },
          runGuardsAndResolvers: 'always',
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
              RouteMountPoint.CREATOR,
              extensionRouteProviders
            ),
          ],
        },
      ],
      deps: [ExtensionRouteProvider],
      multi: true,
    },
  ],
})
export class CreatorRoutingModule {}
