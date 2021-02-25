import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentType } from '../../../../models/content-type.enum';
import { AnswerOption } from '../../../../models/answer-option';
import { Observable, Subscription } from 'rxjs';
import { ContentText } from '@arsnova/app/models/content-text';
import { ContentFlashcard } from '@arsnova/app/models/content-flashcard';

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

  @Input() createEvent: Observable<boolean>;
  @Input() contentBody;
  @Input() contentGroup;
  @Input() abstentionsAllowed: boolean;
  @Input() editContent: Content;
  @Output() contentReset = new EventEmitter<boolean>();
  @Output() contentSent = new EventEmitter<Content>();
  @Output() refId = new EventEmitter<string>();

  roomId: string;
  isLoading = true;
  content: Content;
  displayAnswers: DisplayAnswer[] = [];
  newAnswerOptionPoints = 0;
  answerLabels: string[];
  isEditMode = false;

  constructor(protected contentService: ContentService,
              protected notificationService: NotificationService,
              protected translationService: TranslateService,
              protected roomService: RoomService,
              protected globalStorageService: GlobalStorageService,
              protected contentGroupService: ContentGroupService) { }

  ngOnInit(): void {
    this.roomId = this.globalStorageService.getItem(STORAGE_KEYS.ROOM_ID);
    if (this.editContent) {
      this.isEditMode = true;
      this.initContentForEditing();
    } else {
      this.initContentCreation();
    }
    this.createEventSubscription = this.createEvent.subscribe(submit => {
      if (this.prepareContent()) {
        if (this.createContent()) {
          if (submit) {
            this.submitContent();
          } else {
            this.contentSent.emit(this.content);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.createEventSubscription.unsubscribe();
  }

  initContentCreation() {}

  initTemplateAnswers() {
    this.translationService.get(this.answerLabels).subscribe(msgs => {
      for (let i = 0; i < this.answerLabels.length; i++) {
        (this.content as ContentChoice).options.push(new AnswerOption(msgs[this.answerLabels[i]], this.newAnswerOptionPoints));
      }
      this.fillCorrectAnswers();
      this.isLoading = false;
    });
  }

  initContentForEditing() {}

  initContentChoiceEditBase(): AnswerOption[] {
    this.content = (this.editContent as ContentChoice);
    this.contentBody = this.content.body;
    const options = (this.content as ContentChoice).options;
    (this.content as ContentChoice).correctOptionIndexes = [];
    return options;
  }

  initContentTextEditBase() {
    this.content = (this.editContent as ContentText);
  }

  initContentFlashcardEditBase() {
    this.content = (this.editContent as ContentFlashcard);
  }

  createContent(): boolean {
    return true;
  }

  prepareContent() {
    this.content.roomId = this.roomId;
    this.content.body = this.contentBody;
    this.content.abstentionsAllowed = this.abstentionsAllowed;
    if (this.contentBody === '') {
      this.translationService.get('content.no-empty').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      return false;
    }
    return true;
  }

  fillCorrectAnswers() {
    this.displayAnswers = [];
    for (let i = 0; i < (this.content as ContentChoice).options.length; i++) {
      this.displayAnswers.push(new DisplayAnswer((this.content as ContentChoice).options[i],
        (this.content as ContentChoice).correctOptionIndexes.includes(i)));
    }
  }

  resetAfterSubmit() {
    this.contentReset.emit(true);
    if ([ContentType.TEXT, ContentType.SLIDE, ContentType.FLASHCARD].indexOf(this.content.format) === -1) {
      if ([ContentType.CHOICE, ContentType.SORT].indexOf(this.content.format) > -1) {
        (this.content as ContentChoice).options = [];
      }
      (this.content as ContentChoice).correctOptionIndexes = [];
      this.fillCorrectAnswers();
    }
    this.translationService.get('content.submitted').subscribe(message => {
      this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
    });
    this.resetAnswers();
  }

  resetAnswers() {
  }

  submitContent(): void {
    if (!this.isEditMode) {
      this.contentService.addContent(this.content).subscribe(createdContent => {
        this.refId.emit(createdContent.id);
        if (this.contentGroup !== '') {
          this.contentGroupService.addContentToGroup(this.roomId, this.contentGroup, createdContent.id).subscribe();
        }
        this.contentGroupService.saveGroupInMemoryStorage(this.contentGroup);
        this.resetAfterSubmit();
        document.getElementById('body-input').focus();
      });
    } else {
      this.contentService.updateContent(this.content).subscribe(updateContent => {
        this.content = updateContent;
        window.history.back();
        this.translationService.get('content.changes-made').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
        });
      });
    }
  }

}
