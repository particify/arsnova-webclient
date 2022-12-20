import { Component, Input, OnInit } from '@angular/core';
import { ContentText } from '../../../../models/content-text';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ContentType } from '../../../../models/content-type.enum';
import { AnnounceService } from '../../../../services/util/announce.service';

@Component({
  selector: 'app-content-text-creation',
  templateUrl: './content-text-creation.component.html',
})
export class ContentTextCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  @Input() format: ContentType;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService
    );
  }

  initContentCreation() {
    this.content = new ContentText(
      null,
      null,
      '',
      '',
      '',
      [],
      this.format,
      null
    );
  }

  initContentForEditing() {
    this.initContentTextEditBase();
  }
}
