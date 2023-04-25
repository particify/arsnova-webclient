import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '../../../../projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { PresentationComponent } from './presentation/presentation.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ContentPresentationComponent } from '../creator/content-presentation/content-presentation.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { CommentSettingsResolver } from '../../resolver/comment-settings.resolver';

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
    component: CommentPageComponent,
  },
  {
    path: 'feedback',
    component: SurveyPageComponent,
  },
  {
    path: 'series/:seriesName',
    component: ContentPresentationComponent,
  },
  {
    path: 'series/:seriesName/:contentIndex',
    component: ContentPresentationComponent,
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
