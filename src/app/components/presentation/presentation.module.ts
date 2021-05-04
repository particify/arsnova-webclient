import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationRoutingModule } from './presentation-routing.module';
import { GroupPresentationComponent } from './group-presentation/group-presentation.component';
import { CommentPresentationComponent } from './comment-presentation/comment-presentation.component';
import { SurveyPresentationComponent } from './survey-presentation/survey-presentation.component';
import { FlexModule } from '@angular/flex-layout';
import { CreatorModule } from '../creator/creator.module';
import { ControlBarComponent } from './bars/control-bar/control-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtensionPointModule } from '../../../../projects/extension-point/src/lib/extension-point.module';
import { PresentationComponent } from './presentation/presentation.component';
import { SharedModule } from '../shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoaderFactory } from '../../translate-http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { TRANSLATION_MODULE_NAME } from '../../translate-module-name-token';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    GroupPresentationComponent,
    CommentPresentationComponent,
    SurveyPresentationComponent,
    ControlBarComponent,
    PresentationComponent
  ],
  imports: [
    CommonModule,
    PresentationRoutingModule,
    FlexModule,
    CreatorModule,
    MatButtonModule,
    MatIconModule,
    ExtensionPointModule,
    SharedModule,
    MatDividerModule,
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
    MatRippleModule,
    MatSelectModule,
    FormsModule,
    MatMenuModule,
    MatTooltipModule,
  ]
})
export class PresentationModule { }
