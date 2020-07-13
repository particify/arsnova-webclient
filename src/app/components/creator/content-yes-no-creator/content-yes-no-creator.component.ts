import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentChoice } from '../../../models/content-choice';
import { DisplayAnswer } from '../content-choice-creator/content-choice-creator.component';
import { AnswerOption } from '../../../models/answer-option';
import { NotificationService } from '../../../services/util/notification.service';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../services/http/content-group.service';

@Component({
  selector: 'app-content-yes-no-creator',
  templateUrl: './content-yes-no-creator.component.html',
  styleUrls: ['./content-yes-no-creator.component.scss']
})
export class ContentYesNoCreatorComponent implements OnInit {
  @Input() contentSub;
  @Input() contentBod;
  @Input() contentCol;
  @Output() reset = new EventEmitter<boolean>();

  yesno = null;
  answerLabels = [
    'content.yes',
    'content.no'
  ];
  content: ContentChoice = new ContentChoice(
    '0',
    '1',
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

  roomId: string;

  displayAnswers: DisplayAnswer[];
  newAnswerOptionPoints = 0;

  constructor(
    private contentService: ContentService,
    private roomService: RoomService,
    private notificationService: NotificationService,
    private translationService: TranslateService,
    private globalStorageService: GlobalStorageService,
    private contentGroupService: ContentGroupService
  ) {
  }

  ngOnInit() {
    this.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
    this.translationService.get(this.answerLabels).subscribe(msgs => {
      for (let i = 0; i < this.answerLabels.length; i++) {
        this.content.options.push(new AnswerOption(msgs[this.answerLabels[i]], this.newAnswerOptionPoints));
      }
      this.fillCorrectAnswers();
    });
  }

  fillCorrectAnswers() {
    this.displayAnswers = [];
    for (let i = 0; i < this.content.options.length; i++) {
      this.displayAnswers.push(new DisplayAnswer(this.content.options[i], this.content.correctOptionIndexes.includes(i)));
    }
  }

  resetAfterSubmit() {
    this.reset.emit(true);
    this.content.correctOptionIndexes = [];
    this.fillCorrectAnswers();
    this.translationService.get('content.submitted').subscribe(message => {
      this.notificationService.show(message);
    });
  }

  submitContent(): void {
    if (this.contentSub === '' || this.contentBod === '') {
      this.translationService.get('content.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    if (this.yesno !== null) {
      const index = this.yesno ? 0 : 1;
      this.content.options[0].points = this.yesno ? 10 : -10;
      this.content.options[1].points = this.yesno ? -10 : 10;
      this.content.correctOptionIndexes = [index];
    }
    this.contentService.addContent(new ContentChoice(
      null,
      null,
      this.roomId,
      this.contentSub,
      this.contentBod,
      [],
      this.content.options,
      this.content.correctOptionIndexes,
      this.content.multiple,
      ContentType.BINARY,
      null
    )).subscribe(content => {
      if (this.contentCol !== '') {
        this.contentGroupService.addContentToGroup(this.roomId, this.contentCol, content.id).subscribe();
      }
      this.contentGroupService.saveGroupInMemoryStorage(this.contentCol);
      this.resetAfterSubmit();
      document.getElementById('subject-input').focus();
    });
  }
}
