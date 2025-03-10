import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Subject } from 'rxjs';
import { Content } from '@app/core/models/content';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { UserRole } from '@app/core/models/user-roles.enum';
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

interface ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-editing-page',
  templateUrl: './content-editing-page.component.html',
  styleUrls: ['./content-editing-page.component.scss'],
  standalone: false,
})
export class ContentEditingPageComponent
  extends FormComponent
  implements OnInit
{
  @ViewChild('ContentForm') private contentForm!: ContentForm;
  @ViewChild('questionInput') bodyInput!: ElementRef;

  // Route data input below
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) seriesName!: string;
  @Input({ required: true }) room!: Room;
  @Input() isEditMode = false;
  @Input() contentId?: string;

  question = '';
  ContentType = ContentType;
  formats: ContentFormat[] = [];
  selectedFormat?: ContentFormat;

  attachmentData: any;
  linkAttachmentsSubject: Subject<string> = new Subject<string>();

  flipped = false;
  content?: Content;
  textContainsImage = false;
  HintType = HintType;
  abstentionsAllowed = true;
  duration?: number;
  isLoading = true;
  created = false;
  isAnswered = false;
  GroupType = GroupType;

  constructor(
    private translateService: TranslocoService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private formattingService: FormattingService,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private notificationService: NotificationService,
    private contentPublishService: ContentPublishService,
    protected formService: FormService
  ) {
    super(formService);
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
    if (this.isEditMode && this.contentId) {
      this.contentService
        .getContent(this.room.id, this.contentId)
        .subscribe((content) => {
          this.content = content;
          this.question = content.body;
          this.abstentionsAllowed = !!this.content?.abstentionsAllowed;
          this.duration = this.content.duration || undefined;
          this.isEditMode = true;
          const format = this.formats.find(
            (c) => c.name === this.content?.format.toLowerCase()
          );
          if (format) {
            this.selectedFormat = format;
          }
          this.prepareAttachmentData();
          if (
            this.selectedFormat &&
            [
              ContentType.TEXT,
              ContentType.FLASHCARD,
              ContentType.SLIDE,
            ].includes(this.selectedFormat.type)
          ) {
            this.isLoading = false;
          } else {
            this.contentService
              .getAnswer(content.roomId, content.id)
              .subscribe((answer) => {
                this.isAnswered = answer.roundStatistics[0].answerCount > 0;
                this.isLoading = false;
              });
          }
        });
    } else {
      this.prepareAttachmentData();
      this.isLoading = false;
    }

    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
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
    if (this.flipped) {
      this.flipBack();
    } else {
      if (this.prepareContent()) {
        this.flipped = true;
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
    if (this.flipped && !this.isEditMode) {
      this.flipBack();
    }
    this.disableForm();
    if (!this.isEditMode) {
      this.contentService.addContent(this.content).subscribe(
        (createdContent) => {
          this.attachmentData.refIf = createdContent.id;
          this.linkAttachmentsSubject.next(createdContent.id);
          this.contentGroupService
            .addContentToGroup(this.room.id, this.seriesName, createdContent.id)
            .subscribe();
          this.contentGroupService.saveGroupInMemoryStorage(this.seriesName);
          this.afterCreation();
        },
        () => {
          this.enableForm();
        }
      );
    } else {
      this.contentService.updateContent(this.content).subscribe(
        (updateContent) => {
          this.content = updateContent;
          window.history.back();
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

  private flipBack() {
    this.flipped = false;
    this.announceService.announce('creator.content.a11y-back-in-creation');
  }

  private prepareAttachmentData() {
    this.attachmentData = {
      eventsSubject: this.linkAttachmentsSubject,
      refType: 'content',
      detailedView: false,
      refId: this.isEditMode ? this.content?.id : null,
      role: UserRole.OWNER,
    };
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
