import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent, DisplayAnswer } from '../content-creation/content-creation.component';

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
  newAnswerOptionPoints = 0;

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
    const options = this.initContentChoiceEditBase();
    for (const option of options) {
      this.displayAnswers.push(new DisplayAnswer(option, option.points > 0));
    }
    this.isLoading = false;
  }
}
