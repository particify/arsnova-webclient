import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { SurveyPageComponent } from '@app/shared/survey-page/survey-page.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { CommentPageComponent } from '@app/shared/comment-page/comment-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { GroupContentComponent } from './content-list/group-content/group-content.component';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { CreatorPageComponent } from '@app/creator/creator-page.component';

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
    loadChildren: () =>
      import('./room-overview/room-overview.module').then(
        (m) => m.RoomOverviewModule
      ),
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
          component: CreatorPageComponent,
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
