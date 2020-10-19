import { Routes, RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { NgModule } from '@angular/core';
import { AuthenticationGuard } from '../../guards/authentication.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: '',
        component: AdminHomeComponent,
        data: { page: 'status' }
      },
      {
        path: 'status',
        component: AdminHomeComponent,
        data: { page: 'status' }
      },
      {
        path: 'stats',
        component: AdminHomeComponent,
        data: { page: 'stats' }
      },
      {
        path: 'users',
        component: AdminHomeComponent,
        data: { page: 'users' }
      },
      {
        path: 'rooms',
        component: AdminHomeComponent,
        data: { page: 'rooms' }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
