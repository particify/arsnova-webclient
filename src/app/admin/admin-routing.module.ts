import { Routes, RouterModule, ROUTES } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemStatisticsComponent } from './system-statistics/system-statistics.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { TemplateManagementComponent } from '@app/admin/template-management/template-management.component';
import { ReportManagementComponent } from '@app/admin/report-management/report-management.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'stats',
  },
  {
    path: 'status',
    component: SystemStatusComponent,
  },
  {
    path: 'stats',
    component: SystemStatisticsComponent,
  },
  {
    path: 'users',
    component: UserManagementComponent,
  },
  {
    path: 'rooms',
    component: RoomManagementComponent,
  },
  {
    path: 'templates',
    component: TemplateManagementComponent,
  },
  {
    path: 'reports',
    component: ReportManagementComponent,
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
          path: '',
          canActivate: [AuthenticationGuard],
          children: [
            {
              path: '',
              component: AdminHomeComponent,
              children: [
                ...routes,
                ...ExtensionRouteProvider.extractRoutesForMountPoint(
                  RouteMountPoint.ADMIN,
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
export class AdminRoutingModule {}
