import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { PresentationComponent } from './presentation/presentation.component';
import { QrCodeComponent } from '@app/standalone/qr-code/qr-code.component';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ContentGroupResolver } from '@app/core/resolver/content-group.resolver';
import { environment } from '@environments/environment';
import { roomGqlResolver } from '@app/core/resolver/room-gql.resolver';
import { roomViewUserRoleGqlResolver } from '@app/core/resolver/room-view-user-role-gql.resolver';
import { AuthenticationGqlGuard } from '@app/core/guards/authentication-gql.guard';

const routes: Routes = [
  {
    path: '',
    component: QrCodeComponent,
    data: {
      showCopyUrlButton: true,
      showUserCount: true,
      showIcon: true,
    },
  },
  {
    path: 'comments/moderation',
    redirectTo: 'comments',
  },
  {
    path: 'comments',
    data: {
      showCommentPreview: true,
    },
    loadComponent: () =>
      import(
        '@app/standalone/comments-presentation/comments-page.component'
      ).then((m) => m.CommentsPageComponent),
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import(
        '@app/standalone/live-feedback-presentation/live-feedback-page.component'
      ).then((m) => m.LiveFeedbackPageComponent),
  },
  {
    path: 'series/:seriesName',
    loadComponent: () =>
      import(
        '@app/standalone/content-presentation/contents-page.component'
      ).then((m) => m.ContentsPageComponent),
    data: { extendedView: true },
    resolve: {
      contentGroup: ContentGroupResolver,
    },
  },
  {
    path: 'series/:seriesName/:contentIndex',
    loadComponent: () =>
      import(
        '@app/standalone/content-presentation/contents-page.component'
      ).then((m) => m.ContentsPageComponent),
    data: { extendedView: true },
    resolve: {
      contentGroup: ContentGroupResolver,
    },
  },
  {
    path: 'series/:seriesName/edit/:contentId',
    redirectTo: 'series/:seriesName',
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
          path: ':shortId',
          component: PresentationComponent,
          canActivate: [
            environment.graphql ? AuthenticationGqlGuard : AuthenticationGuard,
          ],
          data: {
            requiredRole: UserRole.EDITOR,
            isPresentation: true,
            showStepInfo: true,
            showAnswerCount: true,
            showHotkeyActionButtons: true,
            showCard: false,
          },
          resolve: environment.graphql
            ? {
                room: roomGqlResolver,
                viewRole: roomViewUserRoleGqlResolver,
              }
            : {
                room: RoomResolver,
                viewRole: RoomViewUserRoleResolver,
              },
          runGuardsAndResolvers: 'always',
          children: [
            {
              path: '',
              resolve: {
                commentSettings: CommentSettingsResolver,
              },
              children: [
                ...routes,
                ...ExtensionRouteProvider.extractRoutesForMountPoint(
                  RouteMountPoint.PRESENTATION,
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
export class PresentationRoutingModule {}
