import { Component, Input, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/content-creation/content-creation/content-creation.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Content } from '@app/core/models/content';
import { FormService } from '@app/core/services/util/form.service';

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
    protected announceService: AnnounceService,
    protected formService: FormService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService,
      formService
    );
  }

  initContentCreation() {
    this.content = new Content();
    this.content.format = this.format;
  }

  initContentForEditing() {
    this.initContentTextEditBase();
  }
}
