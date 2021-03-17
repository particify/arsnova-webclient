import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-likert-creation',
  templateUrl: './content-likert-creation.component.html',
  styleUrls: ['./content-likert-creation.component.scss']
})
export class ContentLikertCreationComponent extends ContentCreationComponent implements OnInit {

  answerLabels = [
    'content.strongly-agree',
    'content.agree',
    'content.neither-agree-nor-disagree',
    'content.disagree',
    'content.strongly-disagree'
  ];

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
    this.content = new ContentChoice(
      null,
      null,
      '',
      '',
      '',
      [],
      [],
      [],
      false,
      ContentType.SCALE,
      null
    );
    this.initTemplateAnswers();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.isLoading = false;
  }
}
