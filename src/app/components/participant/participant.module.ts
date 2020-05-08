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
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MarkdownModule } from 'ngx-markdown';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { MatRippleModule } from '@angular/material/core';
import { ContentParticipantComponent } from './content/content-participant.component';

@NgModule({
  imports: [
    CommonModule,
    ParticipantRoutingModule,
    EssentialsModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      },
      isolate: true
    }),
    MarkdownModule,
    CdkStepperModule,
    MatRippleModule
  ],
  declarations: [
    ContentParticipantComponent,
    ContentChoiceParticipantComponent,
    ContentTextParticipantComponent,
    RoomParticipantPageComponent,
    ParticipantContentCarouselPageComponent
  ]
})
export class ParticipantModule {
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/participant/', '.json');
}
