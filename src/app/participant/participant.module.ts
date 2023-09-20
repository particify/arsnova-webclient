import { NgModule } from '@angular/core';
import { ParticipantRoutingModule } from './participant-routing.module';
import { extensions } from './participant.extensions';
import { CoreModule } from '@app/core/core.module';
import { ContentChoiceParticipantComponent } from './content/content-choice-participant/content-choice-participant.component';
import { ContentTextParticipantComponent } from './content/content-text-participant/content-text-participant.component';
import { SharedModule } from '@app/shared/shared.module';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { ContentParticipantComponent } from './content/content-participant/content-participant.component';
import { ContentSortParticipantComponent } from './content/content-sort-participant/content-sort-participant.component';
import { ContentWordcloudParticipantComponent } from './content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentScaleParticipantComponent } from './content/content-scale-participant/content-scale-participant.component';
import { SeriesOverviewComponent } from './series-overview/series-overview.component';
import { ContentPrioritizationParticipantComponent } from './content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ParticipantPageComponent } from './participant-page.component';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { InfoChartComponent } from './series-overview/info-chart/info-chart.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';

@NgModule({
  imports: [
    extensions,
    ParticipantRoutingModule,
    CoreModule,
    SharedModule,
    TranslocoModule,
    StepperComponent,
    CdkStepperModule,
    ExtensionPointModule,
    FooterComponent,
    RenderedTextComponent,
    HintComponent,
    LoadingButtonComponent,
  ],
  declarations: [
    ContentChoiceParticipantComponent,
    ContentScaleParticipantComponent,
    ContentTextParticipantComponent,
    ParticipantContentCarouselPageComponent,
    ContentParticipantComponent,
    ContentSortParticipantComponent,
    ContentWordcloudParticipantComponent,
    SeriesOverviewComponent,
    ContentPrioritizationParticipantComponent,
    ParticipantPageComponent,
    InfoChartComponent,
  ],
  providers: [provideTranslocoScope('participant'), ContentCarouselService],
})
export class ParticipantModule {}
