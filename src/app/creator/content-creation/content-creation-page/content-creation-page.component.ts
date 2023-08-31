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

class ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-creation-page.component.html',
  styleUrls: ['./content-creation-page.component.scss'],
})
export class ContentCreationPageComponent
  extends FormComponent
  implements OnInit
{
  @ViewChild('questionInput') bodyInput: ElementRef;
  createEventSubject: Subject<boolean> = new Subject<boolean>();
  question: string;
  ContentType = ContentType;
  formats: ContentFormat[] = [];
  selectedFormat: ContentFormat;

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

  constructor(
    private translateService: TranslocoService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    private formattingService: FormattingService,
    private contentService: ContentService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit() {
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
    this.route.data.subscribe((data) => {
      if (data.isEditMode) {
        this.contentService
          .getContent(data.room.id, this.route.snapshot.params['contentId'])
          .subscribe((content) => {
            this.content = content;
            this.question = this.content.body;
            this.abstentionsAllowed = this.content.abstentionsAllowed;
            this.isEditMode = true;
            const format = this.formats.find(
              (c) => c.name === this.content?.format.toLowerCase()
            );
            if (format) {
              this.selectedFormat = format;
            }
            this.prepareAttachmentData();
            this.isLoading = false;
          });
      } else {
        this.prepareAttachmentData();
        this.isLoading = false;
      }
    });
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
  }

  reset() {
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

  flipBack(flip: boolean) {
    this.flipped = false;
    this.announceService.announce('content.a11y-back-in-creation');
    if (flip) {
      this.emitCreateEvent(true);
    }
    this.content = undefined;
  }

  saveContent(content: Content) {
    this.content = content;
  }

  changeFormat(format: ContentFormat) {
    this.selectedFormat = format;
  }

  showPreview() {
    this.emitCreateEvent(false);
    if (this.content) {
      this.flipped = true;
    }
  }

  emitCreateEvent(submit: boolean) {
    this.createEventSubject.next(submit);
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  linkAttachments(id: string) {
    this.linkAttachmentsSubject.next(id);
  }

  prepareAttachmentData() {
    this.attachmentData = {
      eventsSubject: this.linkAttachmentsSubject,
      refType: 'content',
      detailedView: false,
      refId: this.isEditMode ? this.content?.id : null,
      role: UserRole.OWNER,
    };
  }
}
