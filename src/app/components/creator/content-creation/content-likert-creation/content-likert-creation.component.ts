import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';

@Component({
  selector: 'app-content-likert-creator',
  templateUrl: './content-likert-creation.component.html',
  styleUrls: ['./content-likert-creation.component.scss']
})
export class ContentLikertCreationComponent extends ContentCreationComponent implements OnInit {

  likertScales = [
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
    this.translationService.get(this.likertScales).subscribe(msgs => {
      for (let i = 0; i < this.likertScales.length; i++) {
        (this.content as ContentChoice).options.push(new AnswerOption(msgs[this.likertScales[i]], this.newAnswerOptionPoints));
      }
      this.fillCorrectAnswers();
      this.isLoading = false;
    });
  }

  createContent() {
    this.submitContent(this.content);
  }
}
