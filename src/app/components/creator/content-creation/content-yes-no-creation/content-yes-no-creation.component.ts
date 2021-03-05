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
  selector: 'app-content-yes-no-creation',
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
    this.displayAnswers = this.initContentChoiceEditBase();
    this.isLoading = false;
  }

  createContent(): boolean {
    if (this.yesno > -1) {
      const index = this.yesno;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    }
    return true;
  }

  resetAnswers() {
    this.yesno = -1;
  }
}
