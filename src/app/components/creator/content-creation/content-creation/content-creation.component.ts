import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentType } from '../../../../models/content-type.enum';
import { AnswerOption } from '../../../../models/answer-option';
import { Observable, Subscription } from 'rxjs';

export class DisplayAnswer {
  answerOption: AnswerOption;
  correct: boolean;

  constructor(answerOption: AnswerOption, correct: boolean) {
    this.answerOption = answerOption;
    this.correct = correct;
  }
}

@Component({
  selector: 'app-content-creation',
  templateUrl: './content-creation.component.html',
  styleUrls: ['./content-creation.component.scss']
})
export class ContentCreationComponent implements OnInit, OnDestroy {

  private createEventSubscription: Subscription;

  @Input() createEvent: Observable<void>;
  @Input() contentBody;
  @Input() contentGroup;
  @Output() reset = new EventEmitter<boolean>();

  roomId: string;
  isLoading = true;
  content: Content;
  displayAnswers: DisplayAnswer[] = [];

  constructor(protected contentService: ContentService,
              protected notificationService: NotificationService,
              protected translationService: TranslateService,
              protected roomService: RoomService,
              protected globalStorageService: GlobalStorageService,
              protected contentGroupService: ContentGroupService) { }

  ngOnInit(): void {
    this.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
    this.initContentCreation();
    this.createEventSubscription = this.createEvent.subscribe(() => {
      this.createContent();
    });
  }

  ngOnDestroy(): void {
    this.createEventSubscription.unsubscribe();
  }

  initContentCreation() {}

  createContent() {}

  fillCorrectAnswers() {
    this.displayAnswers = [];
    for (let i = 0; i < (this.content as ContentChoice).options.length; i++) {
      this.displayAnswers.push(new DisplayAnswer((this.content as ContentChoice).options[i],
        (this.content as ContentChoice).correctOptionIndexes.includes(i)));
    }
  }

  resetAfterSubmit() {
    this.reset.emit(true);
    if (this.content.format !== ContentType.TEXT && this.content.format !== ContentType.SLIDE) {
      if (this.content.format === ContentType.CHOICE) {
        (this.content as ContentChoice).options = [];
      }
      (this.content as ContentChoice).correctOptionIndexes = [];
      this.fillCorrectAnswers();
    }
    this.translationService.get('content.submitted').subscribe(message => {
      this.notificationService.show(message);
    });
  }

  submitContent(newContent: Content): void {
    if (this.contentBody === '') {
      this.translationService.get('content.no-empty').subscribe(message => {
        this.notificationService.show(message);
      });
      return;
    }
    newContent.roomId = this.roomId;
    newContent.body = this.contentBody;
    newContent.subject = 'Subject';
    this.contentService.addContent(newContent).subscribe(createdContent => {
      if (this.contentGroup !== '') {
        this.contentGroupService.addContentToGroup(this.roomId, this.contentGroup, createdContent.id).subscribe();
      }
      this.contentGroupService.saveGroupInMemoryStorage(this.contentGroup);
      this.resetAfterSubmit();
      document.getElementById('body-input').focus();
    });
  }

}
