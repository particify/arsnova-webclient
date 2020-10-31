import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantRoutingModule } from './participant-routing.module';
import { EssentialsModule } from '../essentials/essentials.module';
import { ContentChoiceParticipantComponent } from './content/content-choice-participant/content-choice-participant.component';
import { ContentTextParticipantComponent } from './content/content-text-participant/content-text-participant.component';
import { RoomParticipantPageComponent } from './room-participant-page/room-participant-page.component';
import { SharedModule } from '../shared/shared.module';
import { ParticipantContentCarouselPageComponent } from './participant-content-carousel-page/participant-content-carousel-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatRippleModule } from '@angular/material/core';
import { ContentParticipantComponent } from './content/content-participant.component';
import { ContentSlideParticipantComponent } from './content/content-slide-participant/content-slide-participant.component';
import { TRANSLATION_MODULE_NAME } from '../../translate-module-name-token';
import { TranslateHttpLoaderFactory } from '../../translate-http-loader-factory';

@NgModule({
  imports: [
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
    MatRippleModule
  ],
  declarations: [
    ContentParticipantComponent,
    ContentChoiceParticipantComponent,
    ContentTextParticipantComponent,
    RoomParticipantPageComponent,
    ParticipantContentCarouselPageComponent,
    ContentSlideParticipantComponent
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'participant' }
  ]
})
export class ParticipantModule {
}
