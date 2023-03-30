import { NgModule } from '@angular/core';
import { ParticipantRoutingModule } from './participant-routing.module';
import { extensions } from './participant.extensions';
import { CoreModule } from '@core/core.module';
import { ContentChoiceParticipantComponent } from './content/content-choice-participant/content-choice-participant.component';
import { ContentTextParticipantComponent } from './content/content-text-participant/content-text-participant.component';
import { SharedModule } from '@shared/shared.module';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { TRANSLATION_MODULE_NAME } from '@app/translate-module-name-token';
import { TranslateHttpLoaderFactory } from '@app/translate-http-loader-factory';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { ContentParticipantComponent } from './content/content-participant/content-participant.component';
import { ContentSortParticipantComponent } from './content/content-sort-participant/content-sort-participant.component';
import { ContentWordcloudParticipantComponent } from './content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentScaleParticipantComponent } from './content/content-scale-participant/content-scale-participant.component';
import { SeriesOverviewComponent } from './series-overview/series-overview.component';
import { ParticipantOverviewComponent } from './participant-overview/participant-overview.component';
import { ContentPrioritizationParticipantComponent } from './content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentCarouselService } from '@core/services/util/content-carousel.service';

@NgModule({
  imports: [
    extensions,
    ParticipantRoutingModule,
    CoreModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient, TRANSLATION_MODULE_NAME],
      },
      isolate: true,
    }),
    CdkStepperModule,
    ExtensionPointModule,
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
    ParticipantOverviewComponent,
    ContentPrioritizationParticipantComponent,
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'participant' },
    ContentCarouselService,
  ],
})
export class ParticipantModule {}
