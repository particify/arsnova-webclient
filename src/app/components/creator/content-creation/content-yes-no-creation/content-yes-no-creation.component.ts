import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import { NotificationService } from '../../../../services/util/notification.service';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentService } from '../../../../services/http/content.service';
import { RoomService } from '../../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';

@Component({
  selector: 'app-content-yes-no-creator',
  templateUrl: './content-yes-no-creation.component.html',
  styleUrls: ['./content-yes-no-creation.component.scss']
})
export class ContentYesNoCreationComponent extends ContentCreationComponent implements OnInit {

  yesno = null;
  answerLabels = [
    'content.yes',
    'content.no'
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
    super(contentService, notificationService, translationService, roomService,  globalStorageService, contentGroupService);
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
      ContentType.BINARY,
      null
    );
    this.translationService.get(this.answerLabels).subscribe(msgs => {
      for (let i = 0; i < this.answerLabels.length; i++) {
        (this.content as ContentChoice).options.push(new AnswerOption(msgs[this.answerLabels[i]], this.newAnswerOptionPoints));
      }
      this.fillCorrectAnswers();
    });
  }

  createContent(): boolean {
    if (this.yesno !== null) {
      const index = this.yesno ? 0 : 1;
      (this.content as ContentChoice).options[0].points = this.yesno ? 10 : -10;
      (this.content as ContentChoice).options[1].points = this.yesno ? -10 : 10;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    }
    return true;
  }
}
