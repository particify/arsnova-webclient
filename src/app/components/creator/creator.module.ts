import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorRoutingModule } from './creator-routing.module';
import { ContentChoiceCreationComponent } from './content-creation/content-choice-creation/content-choice-creation.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { ContentLikertCreationComponent } from './content-creation/content-likert-creation/content-likert-creation.component';
import { ContentTextCreationComponent } from './content-creation/content-text-creation/content-text-creation.component';
import { ContentYesNoCreationComponent } from './content-creation/content-yes-no-creation/content-yes-no-creation.component';
import { RoomCreatorPageComponent } from './room-creator-page/room-creator-page.component';
import { EssentialsModule } from '../essentials/essentials.module';
import { RoomComponent } from './settings/room/room.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { AccessComponent } from './settings/access/access.component';
import { BonusTokenComponent } from './settings/bonus-token/bonus-token.component';
import { CommentSettingsComponent } from './settings/comment-settings/comment-settings.component';
import { ContentGroupCreationComponent } from '../shared/_dialogs/content-group-creation/content-group-creation.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { LooseContentComponent } from './content-list/loose-content/loose-content.component';
import { GroupContentComponent } from './content-list/group-content/group-content.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentCreationComponent } from './content-creation/content-creation/content-creation.component';
import { PreviewComponent } from './content-creation/preview/preview.component';
import { TRANSLATION_MODULE_NAME } from '../../translate-module-name-token';
import { TranslateHttpLoaderFactory } from '../../translate-http-loader-factory';
import { ExtensionPointModule } from '../../../../projects/extension-point/src/lib/extension-point.module';
import { ContentSortCreationComponent } from './content-creation/content-sort-creation/content-sort-creation.component';
import { ContentFlashcardCreationComponent } from './content-creation/content-flashcard-creation/content-flashcard-creation.component';

@NgModule({
  imports: [
    CommonModule,
    CreatorRoutingModule,
    EssentialsModule,
    SharedModule,
    DragDropModule,
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
    ExtensionPointModule
  ],
  declarations: [
    ContentChoiceCreationComponent,
    ContentCreationPageComponent,
    ContentLikertCreationComponent,
    ContentTextCreationComponent,
    ContentYesNoCreationComponent,
    RoomCreatorPageComponent,
    RoomComponent,
    LooseContentComponent,
    ContentPresentationComponent,
    AccessComponent,
    BonusTokenComponent,
    CommentSettingsComponent,
    ContentGroupCreationComponent,
    SettingsComponent,
    SettingsPageComponent,
    GroupContentComponent,
    ContentCreationComponent,
    PreviewComponent,
    ContentSortCreationComponent,
    ContentFlashcardCreationComponent
  ],
  providers: [
    { provide: TRANSLATION_MODULE_NAME, useValue: 'creator' }
  ]
})
export class CreatorModule {
}
