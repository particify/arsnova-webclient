import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { ExtensionRouteProvider, RouteMountPoint } from '../../../../projects/extension-point/src/lib/extension-route';
import { UserRole } from '../../models/user-roles.enum';
import { RoomParticipantPageComponent } from './room-participant-page/room-participant-page.component';
import { SurveyPageComponent } from '../shared/survey-page/survey-page.component';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { CommentPageComponent } from '../shared/comment-page/comment-page.component';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { RoomUserRoleResolver } from '../../resolver/room-user-role.resolver';

const routes: Routes = [
  {
    path: '',
    component: RoomParticipantPageComponent,
    resolve: {
      room: RoomResolver,
      userRole: RoomUserRoleResolver
    }
  },
  {
    path: 'comments',
    component: CommentPageComponent,
    resolve: {
      room: RoomResolver
    }
  },
  {
    path: 'survey',
    component: SurveyPageComponent,
    resolve: {
      room: RoomResolver
    }
  },
  {
    path: 'group/:contentGroup',
    component: ParticipantContentCarouselPageComponent,
    resolve: {
      room: RoomResolver
    }
  },
  {
    path: 'group/:contentGroup/:contentIndex',
    component: ParticipantContentCarouselPageComponent,
    resolve: {
      room: RoomResolver
    }
  }
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
          canActivate: [AuthenticationGuard],
          data: { requiredRole: UserRole.PARTICIPANT },
          resolve: {
            room: RoomResolver,
            viewRole: RoomViewUserRoleResolver
          },
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
                RouteMountPoint.PARTICIPANT, extensionRouteProviders)
          ]
        }
      ],
      deps: [ExtensionRouteProvider],
      multi: true
    }
  ]
})
export class ParticipantRoutingModule {
}
