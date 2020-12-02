import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
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

  yesno = -1;
  answerLabels = [
    'content.yes',
    'content.no'
  ];

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
    this.initTemplateAnswers();
  }

  initContentForEditing() {
    const options = this.initContentChoiceEditBase();
    for (let i = 0; i < options.length; i++) {
      if (options[i].points > 0) {
        this.yesno = i;
        (this.content as ContentChoice).correctOptionIndexes.push(i);
      }
    }
    this.isLoading = false;
  }

  createContent(): boolean {
    if (this.yesno > -1) {
      const index = this.yesno;
      (this.content as ContentChoice).options[0].points = index === 0 ? 10 : -10;
      (this.content as ContentChoice).options[1].points = index === 0 ? -10 : 10;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    } else {
      (this.content as ContentChoice).options[0].points = this.newAnswerOptionPoints;
      (this.content as ContentChoice).options[1].points = this.newAnswerOptionPoints;
    }
    return true;
  }

  resetAnswers() {
    this.yesno = -1;
  }
}
