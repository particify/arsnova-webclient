import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomOverviewRoutingModule } from './room-overview-routing.module';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { HintComponent } from '@app/standalone/hint/hint.component';

@NgModule({
  imports: [
    CommonModule,
    RoomOverviewRoutingModule,
    CoreModule,
    ContentGroupsComponent,
    LoadingIndicatorComponent,
    ExtensionPointModule,
    HintComponent,
    RoomOverviewPageComponent,
  ],
})
export class RoomOverviewModule {}
