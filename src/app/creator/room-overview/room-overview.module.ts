import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomOverviewRoutingModule } from './room-overview-routing.module';
import { RoomOverviewPageComponent } from '@app/creator/room-overview/room-overview-page.component';
import { CoreModule } from '@app/core/core.module';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { ContentGroupsComponent } from '@app/standalone/content-groups/content-groups.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { FeatureCardComponent } from '@app/standalone/feature-card/feature-card.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LiveFeedbackCardComponent } from '@app/standalone/feature-card/live-feedback-card/live-feedback-card.component';
import { CommentsCardComponent } from '@app/standalone/feature-card/comments-card/comments-card.component';

@NgModule({
  declarations: [RoomOverviewPageComponent],
  imports: [
    CommonModule,
    RoomOverviewRoutingModule,
    CoreModule,
    DividerComponent,
    ContentGroupsComponent,
    LoadingIndicatorComponent,
    ExtensionPointModule,
    HintComponent,
    FeatureCardComponent,
    RenderedTextComponent,
    LiveFeedbackCardComponent,
    CommentsCardComponent,
  ],
})
export class RoomOverviewModule {}
