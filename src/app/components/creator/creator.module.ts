import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorRoutingModule } from './creator-routing.module';
import { ContentChoiceCreatorComponent } from './content-choice-creator/content-choice-creator.component';
import { ContentCreatePageComponent } from './content-create-page/content-create-page.component';
import { ContentLikertCreatorComponent } from './content-likert-creator/content-likert-creator.component';
import { ContentTextCreatorComponent } from './content-text-creator/content-text-creator.component';
import { ContentYesNoCreatorComponent } from './content-yes-no-creator/content-yes-no-creator.component';
import { RoomCreatorPageComponent } from './room-creator-page/room-creator-page.component';
import { EssentialsModule } from '../essentials/essentials.module';
import { ModeratorModule } from '../moderator/moderator.module';
import { RoomComponent } from './settings/room/room.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContentListComponent } from './content-list/content-list.component';
import { ContentEditComponent } from '../shared/_dialogs/content-edit/content-edit.component';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { ModeratorsComponent } from './settings/moderators/moderators.component';
import { BonusTokenComponent } from './settings/bonus-token/bonus-token.component';
import { CommentSettingsComponent } from './settings/comment-settings/comment-settings.component';
import { TagsComponent } from './settings/tags/tags.component';
import { MarkdownModule } from 'ngx-markdown';
import { ContentGroupCreationComponent } from '../shared/_dialogs/content-group-creation/content-group-creation.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { LooseContentComponent } from './loose-content/loose-content.component';
import { GroupContentComponent } from './group-content/group-content.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    CreatorRoutingModule,
    EssentialsModule,
    SharedModule,
    ModeratorModule,
    DragDropModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      },
      isolate: true
    }),
    MarkdownModule
  ],
  declarations: [
    ContentChoiceCreatorComponent,
    ContentCreatePageComponent,
    ContentLikertCreatorComponent,
    ContentTextCreatorComponent,
    ContentYesNoCreatorComponent,
    RoomCreatorPageComponent,
    RoomComponent,
    ContentListComponent,
    LooseContentComponent,
    ContentEditComponent,
    ContentPresentationComponent,
    ModeratorsComponent,
    BonusTokenComponent,
    CommentSettingsComponent,
    TagsComponent,
    ContentGroupCreationComponent,
    SettingsComponent,
    SettingsPageComponent,
    GroupContentComponent
  ]
})
export class CreatorModule {
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/creator/', '.json');
}
