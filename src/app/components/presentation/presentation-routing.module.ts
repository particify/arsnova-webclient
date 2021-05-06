import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { ExtensionRouteProvider, RouteMountPoint } from '../../../../projects/extension-point/src/lib/extension-route';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { UserRole } from '../../models/user-roles.enum';
import { RoomResolver } from '../../resolver/room.resolver';
import { RoomViewUserRoleResolver } from '../../resolver/room-view-user-role.resolver';
import { PresentationComponent } from './presentation/presentation.component';

const routes: Routes = [
  {
    path: '',
    component: PresentationComponent
  },
  {
    path: 'comments',
    component: PresentationComponent,
    data: {
      feature: 'comments'
    }
  },
  {
    path: 'survey',
    component: PresentationComponent,
    data: {
      feature: 'survey'
    }
  },
  {
    path: ':contentGroup',
    component: PresentationComponent,
    data: {
      feature: 'group'
    }
  },
  {
    path: ':contentGroup/:contentIndex',
    component: PresentationComponent,
    data: {
      feature: 'group'
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
          path: ':shortId',
          canActivate: [AuthenticationGuard],
          data: {
            requiredRole: UserRole.CREATOR,
            isPresentation: true
          },
          resolve: {
            room: RoomResolver,
            viewRole: RoomViewUserRoleResolver
          },
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
              RouteMountPoint.PRESENTATION, extensionRouteProviders)
          ]
        }
      ],
      deps: [ExtensionRouteProvider],
      multi: true
    }
  ]
})
export class PresentationRoutingModule { }
