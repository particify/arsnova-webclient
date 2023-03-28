import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { UserRole } from '@core/models/user-roles.enum';
import { SurveyPageComponent } from '@shared/survey-page/survey-page.component';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { CommentPageComponent } from '@shared/comment-page/comment-page.component';
import { RoomResolver } from '@core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@core/resolver/room-view-user-role.resolver';
import { AuthenticationGuard } from '@core/guards/authentication.guard';
import { RoomUserRoleResolver } from '@core/resolver/room-user-role.resolver';
import { Features } from '@core/models/features.enum';
import { RoomPageComponent } from '@shared/room-page/room-page.component';
import { ParticipantOverviewComponent } from './participant-overview/participant-overview.component';
import { CommentSettingsResolver } from '@core/resolver/comment-settings.resolver';

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
    component: ParticipantOverviewComponent,
  },
  {
    path: 'comments',
    component: CommentPageComponent,
    data: {
      feature: Features.COMMENTS,
    },
  },
  {
    path: 'feedback',
    component: SurveyPageComponent,
    data: {
      feature: Features.FEEDBACK,
    },
  },
  {
    path: 'series/:seriesName',
    component: ParticipantContentCarouselPageComponent,
    data: {
      feature: Features.CONTENTS,
    },
  },
  {
    path: 'series/:seriesName/:contentIndex',
    component: ParticipantContentCarouselPageComponent,
    data: {
      feature: Features.CONTENTS,
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
          component: RoomPageComponent,
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
