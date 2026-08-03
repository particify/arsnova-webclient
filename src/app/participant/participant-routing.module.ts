import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { UserRole } from '@app/core/models/user-roles.enum';
import { legacyRoomResolver } from '@app/core/resolver/legacy-room.resolver';
import { roomIdResolver } from '@app/core/resolver/room-id.resolver';
import { roomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { roomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { ParticipantPageComponent } from '@app/participant/participant-page.component';
import { ParentRoute } from '@app/core/models/parent-route';
import { userSettingsResolver } from '@app/core/resolver/user-settings.resolver';
import { languageResolver } from '@app/core/resolver/language.resolver';
import { questionnaireResolver } from '@app/core/resolver/questionnaire.resolver';
import { QuestionnairePageComponent } from './questionnaire-page/questionnaire-page.component';

const routes: Routes = [
  {
    path: 'series/:seriesName/:contentIndex',
    redirectTo: '',
  },
  {
    path: 'series/:seriesName',
    redirectTo: '',
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
    path: 'questionnaire/:questionnaireId',
    component: QuestionnairePageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      questionnaire: questionnaireResolver,
      settings: userSettingsResolver,
    },
    title: 'questionnaire',
  },
  // Must precede the :contentId route so the literal segment wins the match.
  {
    path: 'questionnaire/:questionnaireId/overview',
    component: QuestionnairePageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
      overview: true,
    },
    resolve: {
      questionnaire: questionnaireResolver,
      settings: userSettingsResolver,
    },
    title: 'questionnaire',
  },
  {
    path: 'questionnaire/:questionnaireId/:contentId',
    component: QuestionnairePageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      questionnaire: questionnaireResolver,
      settings: userSettingsResolver,
    },
    title: 'questionnaire',
  },
  {
    path: 'questionnaire/:questionnaireId/:contentId/:activeTab',
    component: QuestionnairePageComponent,
    data: {
      feature: RoutingFeature.CONTENTS,
    },
    resolve: {
      questionnaire: questionnaireResolver,
      settings: userSettingsResolver,
    },
    title: 'questionnaire',
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
            room: legacyRoomResolver,
            roomId: roomIdResolver,
            viewRole: roomViewUserRoleResolver,
            userRole: roomUserRoleResolver,
            language: languageResolver,
          },
          runGuardsAndResolvers: 'always',
          children: [
            {
              path: '',
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
