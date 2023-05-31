import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomOverviewRoutingModule } from './room-overview-routing.module';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';
import { CoreModule } from '@app/core/core.module';
import { RoomOverviewHeaderComponent } from '@app/standalone/room-overview-header/room-overview-header.component';
import { RoomActionButtonComponent } from '@app/standalone/room-action-button/room-action-button.component';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

@NgModule({
  declarations: [RoomOverviewPageComponent],
  imports: [
    CommonModule,
    RoomOverviewRoutingModule,
    CoreModule,
    RoomOverviewHeaderComponent,
    RoomActionButtonComponent,
    ContentGroupsComponent,
    LoadingIndicatorComponent,
  ],
})
export class RoomOverviewModule {}
