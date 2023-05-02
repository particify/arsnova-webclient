import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';

const routes: Routes = [
  {
    path: '',
    component: RoomOverviewPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomOverviewRoutingModule {}
