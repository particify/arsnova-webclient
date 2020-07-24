import { Routes, RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: AdminHomeComponent
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
