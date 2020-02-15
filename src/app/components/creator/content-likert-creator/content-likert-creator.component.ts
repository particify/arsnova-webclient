import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DisplayAnswer } from '../content-choice-creator/content-choice-creator.component';
import { ContentChoice } from '../../../models/content-choice';
import { AnswerOption } from '../../../models/answer-option';
import { ContentType } from '../../../models/content-type.enum';
import { ContentService } from '../../../services/http/content.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../services/http/room.service';
import { ContentCreatePageComponent } from '../content-create-page/content-create-page.component';

@Component({
  selector: 'app-content-likert-creator',
  templateUrl: './content-likert-creator.component.html',
  styleUrls: ['./content-likert-creator.component.scss']
})
export class ContentLikertCreatorComponent implements OnInit {
  @Input() contentSub;
  @Input() contentBod;
  @Input() contentCol;
  @Output() reset = new EventEmitter<boolean>();

  likertScales = [
    'content.strongly-agree',
    'content.agree',
    'content.neither-agree-nor-disagree',
    'content.disagree',
    'content.strongly-disagree'
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
    ContentType.SCALE,
    null
  );

  displayedColumns = ['label'];
  roomId: string;

  displayAnswers: DisplayAnswer[];
  newAnswerOptionPoints = 0;

  constructor(private contentService: ContentService,
              private notificationService: NotificationService,
              private translationService: TranslateService,
              private roomService: RoomService) {
  }

  ngOnInit() {
    this.roomId = localStorage.getItem(`roomId`);
    this.translationService.get(this.likertScales).subscribe(msgs => {
      for (let i = 0; i < this.likertScales.length; i++) {
        this.content.options.push(new AnswerOption(msgs[this.likertScales[i]], this.newAnswerOptionPoints));
      }
      this.fillCorrectAnswers();
    });
  }

  fillCorrectAnswers() {
    this.displayAnswers = [];
    for (let i = 0; i < this.content.options.length; i++) {
      this.content.correctOptionIndexes.push(i);
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
      ContentType.SCALE,
      null
    )).subscribe(content => {
      if (this.contentCol !== '') {
        this.roomService.addContentToGroup(this.roomId, this.contentCol, content.id).subscribe();
      }
      ContentCreatePageComponent.saveGroupInSessionStorage(this.contentCol);
      this.resetAfterSubmit();
    });
  }
}
