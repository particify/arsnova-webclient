import { Routes, RouterModule, ROUTES } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { NgModule } from '@angular/core';
import { AuthenticationGuard } from '../../guards/authentication.guard';
import { ExtensionRouteProvider, RouteMountPoint } from '../../../../projects/extension-point/src/lib/extension-route';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent,
    data: {page: 'status'}
  },
  {
    path: 'status',
    component: AdminHomeComponent,
    data: {page: 'status'}
  },
  {
    path: 'stats',
    component: AdminHomeComponent,
    data: {page: 'stats'}
  },
  {
    path: 'users',
    component: AdminHomeComponent,
    data: {page: 'users'}
  },
  {
    path: 'rooms',
    component: AdminHomeComponent,
    data: {page: 'rooms'}
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
          path: '',
          canActivate: [AuthenticationGuard],
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
              RouteMountPoint.ADMIN, extensionRouteProviders)
          ]
        }
      ],
      deps: [ExtensionRouteProvider],
      multi: true
    }
  ]
})
export class AdminRoutingModule {
}
