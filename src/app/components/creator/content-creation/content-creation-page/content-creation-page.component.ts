import { AfterContentInit, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../../../../services/util/global-storage.service';
import { ActivatedRoute } from '@angular/router';
import { AnnounceService } from '../../../../services/util/announce.service';
import { Subject } from 'rxjs';
import { Content } from '../../../../models/content';
import { FormattingService } from '../../../../services/http/formatting.service';
import { HINT_TYPES } from '../../../shared/hint/hint.component';
import { UserRole } from '../../../../models/user-roles.enum';
import { ContentService } from '../../../../services/http/content.service';
import { ContentType } from '../../../../models/content-type.enum';

class ContentFormat {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-content-create-page',
  templateUrl: './content-creation-page.component.html',
  styleUrls: ['./content-creation-page.component.scss'],
})
export class ContentCreationPageComponent implements OnInit, AfterContentInit {
  createEventSubject: Subject<boolean> = new Subject<boolean>();
  question: string;
  contentTypes: ContentType[] = Object.values(ContentType);
  formats: ContentFormat[] = [];
  selectedFormat: ContentFormat;

  attachmentData: any;
  linkAttachmentsSubject: Subject<string> = new Subject<string>();

  flipped = false;

  content: Content;
  textContainsImage = false;
  warningType = HINT_TYPES.WARNING;
  abstentionsAllowed = true;
  isEditMode = false;
  isLoading = true;
  created = false;

  constructor(
    private translateService: TranslateService,
    protected langService: LanguageService,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    protected route: ActivatedRoute,
    private formattingService: FormattingService,
    private contentService: ContentService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngAfterContentInit() {
    setTimeout(() => {
      document.getElementById('message-announcer-button').focus();
    }, 700);
  }

  ngOnInit() {
    const iconList = this.contentService.getTypeIcons();
    for (const type of this.contentTypes) {
      this.formats.push({ name: type.toLowerCase(), icon: iconList.get(type) });
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
            this.selectedFormat = this.formats.find(
              (c) => c.name === this.content.format.toLowerCase()
            );
            this.prepareAttachmentData();
            this.isLoading = false;
          });
      } else {
        this.prepareAttachmentData();
        this.isLoading = false;
      }
    });
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
  }

  reset() {
    this.question = '';
    this.content = null;
    this.created = true;
    setTimeout(() => {
      this.created = false;
    }, 300);
  }

  flipBack($event) {
    this.flipped = false;
    this.announceService.announce('content.a11y-back-in-creation');
    if ($event) {
      this.emitCreateEvent(true);
    }
    this.content = null;
  }

  saveContent($event) {
    this.content = $event;
  }

  changeFormat(format: ContentFormat) {
    this.selectedFormat = format;
  }

  showPreview() {
    this.emitCreateEvent(false);
    if (this.content) {
      this.flipped = true;
      setTimeout(() => {
        document.getElementById('preview-header').focus();
      }, 300);
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
      refId: this.isEditMode ? this.content.id : null,
      role: UserRole.CREATOR,
    };
  }
}
