import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ParticipantPageComponent } from '@app/participant/participant-page.component';
import { ParentRoute } from '@app/core/models/parent-route';
import { ContentGroupResolver } from '@app/core/resolver/content-group.resolver';
import { UserSettingsResolver } from '@app/core/resolver/user-settings.resolver';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';

const routes: Routes = [
  {
    path: 'group',
    redirectTo: 'series',
  },
  {
    path: 'survey',
    redirectTo: 'feedback',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./room-overview/room-overview-page.component').then(
        (m) => m.RoomOverviewPageComponent
      ),
    data: {
      parentRoute: ParentRoute.USER,
      feature: RoutingFeature.OVERVIEW,
    },
    title: 'room',
  },
  {
    path: 'comments',
    loadComponent: () =>
      import('./comments/comments-page.component').then(
        (m) => m.CommentsPageComponent
      ),
    data: {
      parentRoute: ParentRoute.ROOM,
      feature: RoutingFeature.COMMENTS,
    },
    title: 'comments',
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./live-feedback/live-feedback-page.component').then(
        (m) => m.LiveFeedbackPageComponent
      ),
    data: {
      parentRoute: ParentRoute.ROOM,
      feature: RoutingFeature.FEEDBACK,
    },
    title: 'live-feedback',
  },
  {
    path: 'series/:seriesName',
    component: ParticipantContentCarouselPageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      contentGroup: ContentGroupResolver,
    },
    title: 'series',
  },
  {
    path: 'series/:seriesName/:contentIndex',
    component: ParticipantContentCarouselPageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      contentGroup: ContentGroupResolver,
      settings: UserSettingsResolver,
    },
    title: 'series',
  },
  {
    path: 'series/:seriesName/:contentIndex/:activeTab',
    component: ParticipantContentCarouselPageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      contentGroup: ContentGroupResolver,
      settings: UserSettingsResolver,
    },
    title: 'series',
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
          component: ParticipantPageComponent,
          canActivate: [AuthenticationGuard],
          data: { requiredRole: UserRole.PARTICIPANT },
          resolve: {
            room: RoomResolver,
            viewRole: RoomViewUserRoleResolver,
            userRole: RoomUserRoleResolver,
          },
          runGuardsAndResolvers: 'always',
          children: [
            {
              path: '',
              resolve: {
                commentSettings: CommentSettingsResolver,
              },
              providers: [CommentSettingsService],
              runGuardsAndResolvers: 'always',
              children: [
                ...routes,
                ...ExtensionRouteProvider.extractRoutesForMountPoint(
                  RouteMountPoint.PARTICIPANT,
                  extensionRouteProviders
                ),
              ],
            },
          ],
        },
      ],
      deps: [ExtensionRouteProvider],
      multi: true,
    },
  ],
})
export class ParticipantRoutingModule {}
