import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { UserRole } from '@app/core/models/user-roles.enum';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { CreatorPageComponent } from '@app/creator/creator-page.component';
import { ParentRoute } from '@app/core/models/parent-route';
import { ContentGroupTemplateSelectionComponent } from '@app/standalone/content-group-template-selection/content-group-template-selection.component';
import { ContentGroupTemplatePreviewComponent } from '@app/standalone/content-group-template-preview/content-group-template-preview.component';

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
    path: 'series/:seriesName',
    loadChildren: () =>
      import('./content-group/content-group.module').then(
        (m) => m.ContentGroupModule
      ),
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
    path: 'templates',
    component: ContentGroupTemplateSelectionComponent,
    title: 'templates',
  },
  {
    path: 'templates/:templateId',
    component: ContentGroupTemplatePreviewComponent,
    title: 'templates',
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
