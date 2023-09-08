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
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { ContentListComponent } from './content-list/content-list.component';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { CreatorPageComponent } from '@app/creator/creator-page.component';
import { ParentRoute } from '@app/core/models/parent-route';

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
    title: 'room',
    data: {
      parentRoute: ParentRoute.USER,
    },
  },
  {
    path: 'settings',
    component: SettingsPageComponent,
    title: 'settings',
  },
  {
    path: 'settings/:settingsName',
    component: SettingsPageComponent,
    title: 'settings',
  },
  {
    path: 'series/:seriesName/create',
    component: ContentCreationPageComponent,
    title: 'content-creation',
  },
  {
    path: 'series/:seriesName/edit/:contentId',
    component: ContentCreationPageComponent,
    data: {
      isEditMode: true,
    },
    title: 'content-edit',
  },
  {
    path: 'series/:seriesName/statistics',
    component: StatisticsPageComponent,
    title: 'series',
  },
  {
    path: 'series/:seriesName/:contentIndex',
    component: ContentPresentationComponent,
    title: 'series',
  },
  {
    path: 'comments',
    loadChildren: () =>
      import('./comments/comments.module').then((m) => m.CommentsModule),
    resolve: {
      commentSettings: CommentSettingsResolver,
    },
    title: 'comments',
    data: {
      parentRoute: ParentRoute.ROOM,
    },
  },
  {
    path: 'feedback',
    loadChildren: () =>
      import('./live-feedback/live-feedback.module').then(
        (m) => m.LiveFeedbackModule
      ),
    title: 'live-feedback',
    data: {
      parentRoute: ParentRoute.ROOM,
    },
  },
  {
    path: 'series/:seriesName',
    component: ContentListComponent,
    title: 'series',
    data: {
      parentRoute: ParentRoute.ROOM,
    },
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
