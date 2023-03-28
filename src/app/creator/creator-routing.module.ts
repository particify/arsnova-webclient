import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '@core/guards/authentication.guard';
import { UserRole } from '@core/models/user-roles.enum';
import { RoomPageComponent } from '@shared/room-page/room-page.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from '@shared/statistics-page/statistics-page.component';
import { SurveyPageComponent } from '@shared/survey-page/survey-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { CommentPageComponent } from '@shared/comment-page/comment-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '@core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@core/resolver/room-view-user-role.resolver';
import { GroupContentComponent } from './content-list/group-content/group-content.component';
import { RoomUserRoleResolver } from '@core/resolver/room-user-role.resolver';
import { CreatorOverviewComponent } from './creator-overview/creator-overview.component';
import { CommentSettingsResolver } from '@core/resolver/comment-settings.resolver';
import { ApiConfigResolver } from '@core/resolver/api-config.resolver';

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
    resolve: {
      apiConfig: ApiConfigResolver,
    },
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
    resolve: {
      commentSettings: CommentSettingsResolver,
    },
  },
  {
    path: 'comments/moderation',
    component: CommentPageComponent,
    data: {
      isModeration: true,
    },
    resolve: {
      commentSettings: CommentSettingsResolver,
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
          data: { requiredRole: UserRole.MODERATOR },
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
