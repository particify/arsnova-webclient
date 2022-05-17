import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantRoutingModule } from './participant-routing.module';
import { extensions } from './participant.extensions';
import { EssentialsModule } from '../essentials/essentials.module';
import { ContentChoiceParticipantComponent } from './content/content-choice-participant/content-choice-participant.component';
import { ContentTextParticipantComponent } from './content/content-text-participant/content-text-participant.component';
import { SharedModule } from '../shared/shared.module';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatRippleModule } from '@angular/material/core';
import { TRANSLATION_MODULE_NAME } from '../../translate-module-name-token';
import { TranslateHttpLoaderFactory } from '../../translate-http-loader-factory';
import { ExtensionPointModule } from '../../../../projects/extension-point/src/lib/extension-point.module';
import { ContentParticipantComponent } from './content/content-participant/content-participant.component';
import { ContentSortParticipantComponent } from './content/content-sort-participant/content-sort-participant.component';
import { ContentWordcloudParticipantComponent } from './content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentScaleParticipantComponent } from './content/content-scale-participant/content-scale-participant.component';
import { SeriesResultsComponent } from './series-results/series-results.component';
import { ParticipantOverviewComponent } from './participant-overview/participant-overview.component';

@NgModule({
  imports: [
    extensions,
    CommonModule,
    ParticipantRoutingModule,
    EssentialsModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (TranslateHttpLoaderFactory),
        deps: [
          HttpClient,
          TRANSLATION_MODULE_NAME
        ]
      },
      isolate: true
    }),
    CdkStepperModule,
    MatRippleModule,
    ExtensionPointModule
  ],
  declarations: [
    ContentChoiceParticipantComponent,
    ContentScaleParticipantComponent,
    ContentTextParticipantComponent,
    ParticipantContentCarouselPageComponent,
    ContentParticipantComponent,
    ContentSortParticipantComponent,
    ContentWordcloudParticipantComponent,
    SeriesResultsComponent,
    ParticipantOverviewComponent
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'participant' }
  ]
})
export class ParticipantModule {
}
