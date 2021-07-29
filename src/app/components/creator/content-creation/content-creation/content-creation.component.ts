import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { Content } from '../../../../models/content';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentType } from '../../../../models/content-type.enum';
import { AnswerOption } from '../../../../models/answer-option';
import { Observable, Subscription } from 'rxjs';
import { ContentText } from '@arsnova/app/models/content-text';
import { ContentFlashcard } from '@arsnova/app/models/content-flashcard';
import { ActivatedRoute } from '@angular/router';
import { AnnounceService } from '../../../../services/util/announce.service';

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
  answerLabels: string[];
  isEditMode = false;

  constructor(protected contentService: ContentService,
              protected notificationService: NotificationService,
              protected translationService: TranslateService,
              protected roomService: RoomService,
              protected contentGroupService: ContentGroupService,
              protected route: ActivatedRoute,
              protected announceService: AnnounceService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.roomId = data.room.id;
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
    });
  }

  ngOnDestroy(): void {
    this.createEventSubscription.unsubscribe();
  }

  initContentCreation() {}

  initTemplateAnswers() {
    this.translationService.get(this.answerLabels).subscribe(msgs => {
      for (let i = 0; i < this.answerLabels.length; i++) {
        (this.content as ContentChoice).options.push(new AnswerOption(msgs[this.answerLabels[i]]));
      }
      this.fillCorrectAnswers();
      this.isLoading = false;
    });
  }

  initContentForEditing() {}

  initContentChoiceEditBase(): DisplayAnswer[] {
    this.content = (this.editContent as ContentChoice);
    this.contentBody = this.content.body;
    return this.getAnswerOptions();
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

  getAnswerOptions(): DisplayAnswer[] {
    const answers: DisplayAnswer[] = [];
    const options = (this.content as ContentChoice).options;
    const correctOptions = (this.content as ContentChoice).correctOptionIndexes;
    options?.map((option, i) => {
      answers.push(new DisplayAnswer(new AnswerOption(option.label), correctOptions?.includes(i)))
    });
    return answers;
  }

  afterAnswerDeletion() {
    this.announceService.announce('content.a11y-answer-deleted');
    this.translationService.get('content.answer-deleted').subscribe(message => {
      this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
    });
  }

  answerExists(label: string): boolean {
    if (this.displayAnswers.map(o => o.answerOption.label).indexOf(label) >= 0) {
      const msg = this.translationService.instant('content.same-answer');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return true;
    } else {
      return false;
    }
  }

  checkForDuplicates(labels: string[]) {
    return labels.filter((answer, index) => labels.indexOf(answer) != index).length > 0;
  }

  saveAnswerLabels(checkForEmpty = false) {
    const answerLabels = this.displayAnswers.map(a => new AnswerOption(a.answerOption.label));
    (this.content as ContentChoice).options = answerLabels;
    if (checkForEmpty) {
      let valid = true;
      let labels = answerLabels.map(a => a.label);
      if (labels.includes('')) {
        this.translationService.get('content.no-empty2').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.FAILED);
        });
        valid = false;
      } else if (this.checkForDuplicates(labels)) {
        const msg = this.translationService.instant('content.same-answer');
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        valid = false;
      }
      return valid;
    }
  }

  fillCorrectAnswers() {
    this.displayAnswers = this.getAnswerOptions();
  }

  resetAfterSubmit() {
    this.contentReset.emit(true);
    if (![ContentType.TEXT, ContentType.SLIDE, ContentType.FLASHCARD, ContentType.WORDCLOUD].includes(this.content.format)) {
      if ([ContentType.CHOICE, ContentType.SORT].includes(this.content.format)) {
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
