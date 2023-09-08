import { NgModule } from '@angular/core';
import { CreatorRoutingModule } from './creator-routing.module';
import { extensions } from './creator.extensions';
import { ContentChoiceCreationComponent } from './content-creation/content-choice-creation/content-choice-creation.component';
import { ContentCreationPageComponent } from './content-creation/content-creation-page/content-creation-page.component';
import { ContentScaleCreationComponent } from './content-creation/content-scale-creation/content-scale-creation.component';
import { ContentTextCreationComponent } from './content-creation/content-text-creation/content-text-creation.component';
import { ContentYesNoCreationComponent } from './content-creation/content-yes-no-creation/content-yes-no-creation.component';
import { CoreModule } from '@app/core/core.module';
import { RoomComponent } from './settings/room/room.component';
import { SharedModule } from '@app/shared/shared.module';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';
import { ContentPresentationComponent } from './content-presentation/content-presentation.component';
import { AccessComponent } from './settings/access/access.component';
import { CommentSettingsComponent } from './settings/comment-settings/comment-settings.component';
import { ContentGroupCreationComponent } from './_dialogs/content-group-creation/content-group-creation.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { ContentListComponent } from './content-list/content-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ContentCreationComponent } from './content-creation/content-creation/content-creation.component';
import { PreviewComponent } from './content-creation/preview/preview.component';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { ContentSortCreationComponent } from './content-creation/content-sort-creation/content-sort-creation.component';
import { ContentFlashcardCreationComponent } from './content-creation/content-flashcard-creation/content-flashcard-creation.component';
import { ContentWordcloudCreationComponent } from './content-creation/content-wordcloud-creation/content-wordcloud-creation.component';
import { ExportComponent } from './_dialogs/export/export.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { PublishContentComponent } from './_dialogs/publish-content/publish-content.component';
import { AnnouncementSettingsComponent } from './settings/announcement-settings/announcement-settings.component';
import { CreateAnswerOptionComponent } from './content-creation/create-answer-option/create-answer-option.component';
import { ContentPrioritizationCreationComponent } from './content-creation/content-prioritization-creation/content-prioritization-creation.component';
import { StatisticListComponent } from '@app/creator/statistic-list/statistic-list.component';
import { StatisticsPageComponent } from '@app/creator/statistics-page/statistics-page.component';
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { CreatorPageComponent } from './creator-page.component';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@NgModule({
  imports: [
    extensions,
    CreatorRoutingModule,
    CoreModule,
    SharedModule,
    DragDropModule,
    TranslocoModule,
    CdkStepperModule,
    ExtensionPointModule,
    SettingsPanelHeaderComponent,
    SettingsSlideToggleComponent,
    HintComponent,
    FooterComponent,
    DividerComponent,
    RenderedTextComponent,
    AnswerCountComponent,
    FormattingToolbarComponent,
    LoadingButtonComponent,
  ],
  declarations: [
    ContentChoiceCreationComponent,
    ContentCreationPageComponent,
    ContentScaleCreationComponent,
    ContentTextCreationComponent,
    ContentYesNoCreationComponent,
    RoomComponent,
    ContentPresentationComponent,
    AccessComponent,
    CommentSettingsComponent,
    ContentGroupCreationComponent,
    SettingsPageComponent,
    ContentListComponent,
    ContentCreationComponent,
    PreviewComponent,
    ContentSortCreationComponent,
    ContentFlashcardCreationComponent,
    ContentWordcloudCreationComponent,
    ExportComponent,
    PublishContentComponent,
    AnnouncementSettingsComponent,
    CreateAnswerOptionComponent,
    ContentPrioritizationCreationComponent,
    StatisticListComponent,
    StatisticsPageComponent,
    CreatorPageComponent,
  ],
  exports: [ContentPresentationComponent],
  providers: [
    provideTranslocoScope('creator'),
    DialogService,
    FocusModeService,
  ],
})
export class CreatorModule {}
