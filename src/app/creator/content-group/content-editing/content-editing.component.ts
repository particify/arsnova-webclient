import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Content } from '@app/core/models/content';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { Room } from '@app/core/models/room';
import { ContentGroupPageService } from '@app/creator/content-group/content-group-page.service';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Dir } from '@angular/cdk/bidi';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle, AsyncPipe } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { ScaleContentFormComponent } from './scale-content-form/scale-content-form.component';
import { BinaryContentFormComponent } from './binary-content-form/binary-content-form.component';
import { FlashcardContentFormComponent } from './flashcard-content-form/flashcard-content-form.component';
import { SortContentFormComponent } from './sort-content-form/sort-content-form.component';
import { WordcloudContentFormComponent } from './wordcloud-content-form/wordcloud-content-form.component';
import { PrioritizationContentFormComponent } from './prioritization-content-form/prioritization-content-form.component';
import { NumericContentFormComponent } from './numeric-content-form/numeric-content-form.component';
import { ShortAnswerContentFormComponent } from './short-answer-content-form/short-answer-content-form.component';
import { ContentPreviewComponent } from '@app/standalone/content-preview/content-preview.component';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { CoreModule } from '@app/core/core.module';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { ContentScale } from '@app/core/models/content-scale';
import { takeUntil } from 'rxjs';

interface ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-editing',
  templateUrl: './content-editing.component.html',
  styleUrls: ['./content-editing.component.scss'],
  imports: [
    FlexModule,
    MatFormField,
    MatSelect,
    HotkeyDirective,
    MatSelectTrigger,
    MatIcon,
    MatOption,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    FormsModule,
    AutofocusDirective,
    FormattingToolbarComponent,
    MatLabel,
    MatInput,
    CdkTextareaAutosize,
    Dir,
    HintComponent,
    MatTooltip,
    NgStyle,
    ExtendedModule,
    ChoiceContentFormComponent,
    ScaleContentFormComponent,
    BinaryContentFormComponent,
    FlashcardContentFormComponent,
    SortContentFormComponent,
    WordcloudContentFormComponent,
    PrioritizationContentFormComponent,
    NumericContentFormComponent,
    ShortAnswerContentFormComponent,
    ContentPreviewComponent,
    MatButton,
    RouterLink,
    LoadingButtonComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
    CoreModule,
    SettingsSlideToggleComponent,
  ],
})
export class ContentEditingComponent
  extends FormComponent
  implements OnInit, OnChanges
{
  private translateService = inject(TranslocoService);
  private announceService = inject(AnnounceService);
  private globalStorageService = inject(GlobalStorageService);
  private formattingService = inject(FormattingService);
  private contentService = inject(ContentService);
  private contentGroupService = inject(ContentGroupService);
  private notificationService = inject(NotificationService);
  private contentPublishService = inject(ContentPublishService);
  private contentGroupPageService = inject(ContentGroupPageService);

  @ViewChild('ContentForm') private contentForm!: ContentForm;
  @ViewChild('questionInput') bodyInput!: ElementRef;

  // Route data input below
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) seriesName!: string;
  @Input({ required: true }) room!: Room;
  @Input() isEditMode = false;
  @Input() contentId?: string;
  @Input() fixedHeight = false;
  @Input() content?: Content;

  question = '';
  ContentType = ContentType;
  formats: ContentFormat[] = [];
  selectedFormat?: ContentFormat;

  isPreview = false;
  textContainsImage = false;
  HintType = HintType;
  abstentionsAllowed = true;
  duration?: number;
  weight = 1;
  isLoading = true;
  created = false;
  isAnswered = false;
  GroupType = GroupType;
  multiple = false;
  correctAnswer = true;
  neutralOption = true;
  questionMaxLength = 2000;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content?.previousValue && changes.content?.currentValue) {
      this.initData();
    }
  }

  ngOnInit() {
    const iconList = this.contentService.getTypeIcons();
    const supportedTypes =
      this.contentGroupService.getContentFormatsOfGroupType(
        this.contentGroup.groupType
      );
    for (const type of supportedTypes) {
      const icon = iconList.get(type);
      if (icon) {
        this.formats.push({
          type: type,
          name: type.toLowerCase(),
          icon: icon,
        });
      }
    }
    this.selectedFormat = this.formats[0];
    if (this.isEditMode) {
      this.initData();
    } else {
      this.correctAnswer = this.contentGroup.groupType === GroupType.QUIZ;
      this.isLoading = false;
    }
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.contentService
      .getAnswersDeleted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentId) => {
        if (contentId === this.content?.id) {
          this.isAnswered = false;
        }
      });
    this.contentGroupService
      .getContentGroupUpdated()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((group) => {
        if (group.id === this.contentGroup.id) {
          this.contentGroup = group;
        }
      });
  }

  private initData() {
    if (!this.content) {
      return;
    }
    this.question = this.content.body;
    this.abstentionsAllowed = !!this.content?.abstentionsAllowed;
    this.duration = this.content.duration || undefined;
    this.weight = this.content.weight || 1;
    this.isEditMode = true;
    const format = this.formats.find(
      (c) => c.name === this.content?.format.toLowerCase()
    );
    if (format) {
      this.selectedFormat = format;
    }
    if (
      this.selectedFormat &&
      [ContentType.TEXT, ContentType.FLASHCARD, ContentType.SLIDE].includes(
        this.selectedFormat.type
      )
    ) {
      this.isLoading = false;
    } else {
      this.contentService
        .getAnswer(this.content.roomId, this.content.id)
        .subscribe((answer) => {
          this.isAnswered = answer.roundStatistics[0].answerCount > 0;
          this.isLoading = false;
        });
      this.determineContentSettings();
    }
  }

  private determineContentSettings() {
    if (
      this.selectedFormat?.type === ContentType.CHOICE ||
      this.selectedFormat?.type === ContentType.BINARY
    ) {
      this.multiple = (this.content as ContentChoice).multiple;
      this.correctAnswer =
        (this.content as ContentChoice).correctOptionIndexes &&
        (this.content as ContentChoice).correctOptionIndexes.length > 0;
    } else if (this.selectedFormat?.type === ContentType.NUMERIC) {
      this.correctAnswer =
        (this.content as ContentNumeric).correctNumber !== undefined;
    } else if (this.selectedFormat?.type === ContentType.SCALE) {
      this.neutralOption = (this.content as ContentScale).optionCount % 2 !== 0;
    }
  }

  private prepareContent(): boolean {
    if (!this.question) {
      const msg = this.translateService.translate(
        'creator.content.no-empty-fields-allowed'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
    if (!this.setContent() || !this.content) {
      return false;
    }
    this.content.roomId = this.room.id;
    this.content.body = this.question;
    this.content.abstentionsAllowed = this.abstentionsAllowed;
    this.content.duration = this.duration;
    this.content.weight = this.weight;
    return true;
  }

  togglePreview() {
    if (this.isPreview) {
      this.showEditing();
    } else {
      if (this.prepareContent()) {
        this.isPreview = true;
      }
    }
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  submitContent(): void {
    if (!this.prepareContent() || !this.content) {
      return;
    }
    this.disableForm();
    if (!this.isEditMode) {
      this.contentService.addContent(this.content).subscribe(
        (createdContent) => {
          this.contentGroupService
            .addContentToGroup(this.room.id, this.seriesName, createdContent.id)
            .subscribe();
          this.contentGroupService.saveGroupInMemoryStorage(this.seriesName);
          this.afterCreation();
          if (this.isPreview) {
            this.showEditing();
          }
          this.contentGroupPageService.updateCreatedContent(createdContent);
        },
        () => {
          this.enableForm();
          if (this.isPreview) {
            this.showEditing();
          }
        }
      );
    } else {
      this.contentService.updateContent(this.content).subscribe(
        (updatedContent) => {
          this.content = updatedContent;
          this.contentGroupPageService.updateEditedContent(updatedContent);
          this.enableForm();
          const msg = this.translateService.translate(
            'creator.content.changes-made'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        () => {
          this.enableForm();
        }
      );
    }
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isGroupLive(this.contentGroup);
  }

  private afterCreation() {
    const msg = this.translateService.translate('creator.content.submitted');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    this.enableForm();
    this.question = '';
    setTimeout(() => {
      this.bodyInput.nativeElement.focus();
    });
    this.content = undefined;
    this.created = true;
    setTimeout(() => {
      this.created = false;
    }, 300);
  }

  private showEditing() {
    this.isPreview = false;
    this.announceService.announce('creator.content.a11y-back-in-creation');
  }

  private setContent(): boolean {
    let content: Content | undefined;
    if (
      this.selectedFormat &&
      ![ContentType.SLIDE, ContentType.TEXT].includes(this.selectedFormat.type)
    ) {
      content = this.contentForm.getContent();
    } else {
      if (!this.isEditMode && this.selectedFormat) {
        content = new Content();
        content.format = this.selectedFormat.type;
      } else {
        return true;
      }
    }
    if (content) {
      this.content = content;
      return true;
    }
    return false;
  }
}
