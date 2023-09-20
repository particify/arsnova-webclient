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
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';

const routes: Routes = [
  {
    path: '',
    component: QrCodeComponent,
  },
  {
    path: 'comments/moderation',
    redirectTo: 'comments',
  },
  {
    path: 'comments',
    loadChildren: () =>
      import('./comments/comments.module').then((m) => m.CommentsModule),
  },
  {
    path: 'feedback',
    loadChildren: () =>
      import('./live-feedback/live-feedback.module').then(
        (m) => m.LiveFeedbackModule
      ),
  },
  {
    path: 'series/:seriesName',
    loadChildren: () =>
      import('./contents/contents.module').then((m) => m.ContentModule),
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
          canActivate: [AuthenticationGuard],
          data: {
            requiredRole: UserRole.EDITOR,
            isPresentation: true,
          },
          resolve: {
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
