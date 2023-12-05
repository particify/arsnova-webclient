import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
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

interface ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-editing-page',
  templateUrl: './content-editing-page.component.html',
  styleUrls: ['./content-editing-page.component.scss'],
})
export class ContentEditingPageComponent
  extends FormComponent
  implements OnInit
{
  @ViewChild('ContentForm') private contentForm!: ContentForm;
  @ViewChild('questionInput') bodyInput!: ElementRef;

  question = '';
  ContentType = ContentType;
  formats: ContentFormat[] = [];
  selectedFormat: ContentFormat;
  seriesName: string;
  roomId: string;

  attachmentData: any;
  linkAttachmentsSubject: Subject<string> = new Subject<string>();

  flipped = false;
  content?: Content;
  textContainsImage = false;
  HintType = HintType;
  abstentionsAllowed = true;
  isEditMode = false;
  isLoading = true;
  created = false;
  isAnswered = false;

  constructor(
    private translateService: TranslocoService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private route: ActivatedRoute,
    private formattingService: FormattingService,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private notificationService: NotificationService,
    protected formService: FormService
  ) {
    super(formService);
    const iconList = this.contentService.getTypeIcons();
    for (const type of Object.values(ContentType)) {
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
    this.seriesName = this.route.snapshot.params['seriesName'];
    this.roomId = this.route.snapshot.data.room.id;
  }

  ngOnInit() {
    if (this.route.snapshot.data.isEditMode) {
      this.contentService
        .getContent(
          this.route.snapshot.data.room.id,
          this.route.snapshot.params['contentId']
        )
        .subscribe((content) => {
          this.content = content;
          this.question = content.body;
          this.abstentionsAllowed = !!this.content?.abstentionsAllowed;
          this.isEditMode = true;
          const format = this.formats.find(
            (c) => c.name === this.content?.format.toLowerCase()
          );
          if (format) {
            this.selectedFormat = format;
          }
          this.prepareAttachmentData();
          this.contentService
            .getAnswer(content.roomId, content.id)
            .subscribe((answer) => {
              console.log(answer.roundStatistics[0]);
              const answerCount =
                answer.roundStatistics[0].independentCounts.reduce(
                  (a, b) => a + b,
                  0
                );
              this.isAnswered = answerCount > 0;
              this.isLoading = false;
            });
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
    this.content.roomId = this.roomId;
    this.content.body = this.question;
    this.content.abstentionsAllowed = this.abstentionsAllowed;
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
            .addContentToGroup(this.roomId, this.seriesName, createdContent.id)
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
      ![ContentType.SLIDE, ContentType.TEXT].includes(this.selectedFormat.type)
    ) {
      content = this.contentForm.getContent();
    } else {
      if (!this.isEditMode) {
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
