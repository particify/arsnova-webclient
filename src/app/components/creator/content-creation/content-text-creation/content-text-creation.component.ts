import { Component, Input, OnInit } from '@angular/core';
import { ContentText } from '../../../../models/content-text';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ContentType } from '../../../../models/content-type.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-text-creation',
  templateUrl: './content-text-creation.component.html',
  styleUrls: ['./content-text-creation.component.scss']
})
export class ContentTextCreationComponent extends ContentCreationComponent implements OnInit {

  @Input() format: ContentType;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute
  ) {
    super(contentService, notificationService, translationService, roomService, contentGroupService, route);
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
