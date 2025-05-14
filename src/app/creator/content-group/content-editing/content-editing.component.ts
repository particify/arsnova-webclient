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
import { TranslocoService } from '@jsverse/transloco';
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
import { FormService } from '@app/core/services/util/form.service';
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

interface ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-editing',
  templateUrl: './content-editing.component.html',
  styleUrls: ['./content-editing.component.scss'],
  standalone: false,
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
  protected formService: FormService;
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
  isLoading = true;
  created = false;
  isAnswered = false;
  GroupType = GroupType;

  constructor() {
    const formService = inject(FormService);

    super(formService);

    this.formService = formService;
  }

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
      this.isLoading = false;
    }

    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
  }

  private initData() {
    if (!this.content) {
      return;
    }
    this.question = this.content.body;
    this.abstentionsAllowed = !!this.content?.abstentionsAllowed;
    this.duration = this.content.duration || undefined;
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
