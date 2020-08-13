import { Component, OnInit } from '@angular/core';
import { ContentText } from '../../../../models/content-text';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ContentType } from '../../../../models/content-type.enum';

@Component({
  selector: 'app-content-text-creator',
  templateUrl: './content-text-creation.component.html',
  styleUrls: ['./content-text-creation.component.scss']
})
export class ContentTextCreationComponent extends ContentCreationComponent implements OnInit {

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected globalStorageService: GlobalStorageService,
    protected contentGroupService: ContentGroupService
  ) {
    super(contentService, notificationService, translationService, roomService, globalStorageService, contentGroupService);
  }

  initContentCreation() {
    this.content = new ContentText(
      null,
      null,
      '',
      '',
      '',
      [],
      ContentType.TEXT,
      null
    );
  }
}
