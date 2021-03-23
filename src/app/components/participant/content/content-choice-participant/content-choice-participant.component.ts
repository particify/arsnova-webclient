import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { AnswerOption } from '../../../../models/answer-option';
import { ContentAnswerService } from '../../../../services/http/content-answer.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { ChoiceAnswer } from '../../../../models/choice-answer';
import { ContentType } from '../../../../models/content-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '../../../../services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '../content-participant-base.component';
import { ContentService } from '../../../../services/http/content.service';

class CheckedAnswer {
  answerOption: AnswerOption;
  checked: boolean;

  constructor(answerOption: AnswerOption, checked: boolean) {
    this.answerOption = answerOption;
    this.checked = checked;
  }
}

@Component({
  selector: 'app-content-choice-participant',
  templateUrl: './content-choice-participant.component.html',
  styleUrls: ['./content-choice-participant.component.scss']
})
export class ContentChoiceParticipantComponent extends ContentParticipantBaseComponent implements OnInit {

  @Input() content: ContentChoice;
  @Input() answer: ChoiceAnswer;
  @Input() alreadySent: boolean;
  @Input() sendEvent: EventEmitter<string>;
  @Input() statsPublished: boolean;
  @Input() correctOptionsPublished: boolean;
  @Output() answerChanged = new EventEmitter<ChoiceAnswer>();

  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  selectedSingleAnswer: string;
  checkedAnswers: CheckedAnswer[] = [];
  correctOptionIndexes: number[] = [];
  isCorrect = false;
  isChoice = false;
  hasAbstained = false;
  shortId: string;
  multipleAlreadyAnswered = '';
  allAnswers = '';

  constructor(
    protected authenticationService: AuthenticationService,
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    private contentService: ContentService
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  initAnswer(userId: string) {
    for (const answerOption of this.content.options) {
      this.checkedAnswers.push(new CheckedAnswer(answerOption, false));
    }
    if (this.answer) {
      if (this.answer.selectedChoiceIndexes && this.answer.selectedChoiceIndexes.length > 0) {
        for (const i of this.answer.selectedChoiceIndexes) {
          this.checkedAnswers[i].checked = true;
          this.multipleAlreadyAnswered += this.checkedAnswers[i].answerOption.label + '&';
          if (!this.content.multiple) {
            this.selectedSingleAnswer = this.checkedAnswers[i].answerOption.label;
          }
        }
      }
      if (this.answer.selectedChoiceIndexes) {
        this.getCorrectAnswerOptions();
      } else {
        this.hasAbstained = true;
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  getCorrectAnswerOptions() {
    if (this.correctOptionsPublished) {
      this.contentService.getCorrectChoiceIndexes(this.content.roomId, this.content.id).subscribe(correctOptions => {
        this.correctOptionIndexes = correctOptions;
        (this.content as ContentChoice).correctOptionIndexes = this.correctOptionIndexes;
        this.getCorrectAnswer();
        if (this.isChoice) {
          this.checkAnswer(this.answer.selectedChoiceIndexes);
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  getCorrectAnswer() {
    this.checkIfCorrectAnswer();
    if (!this.isChoice) {
      for (const i in this.content.options) {
        if (this.content.options[i]) {
          this.allAnswers += this.content.options[i].label + '&';
        }
      }
    }
  }

  checkIfCorrectAnswer() {
    const correctOptions = (this.content as ContentChoice).correctOptionIndexes;
    const noCorrect = !correctOptions || correctOptions.length === 0;
    if (!noCorrect) {
      this.isChoice = true;
    }
  }

  checkAnswer(selectedAnswers: number[]) {
    if (this.correctOptionIndexes.length === selectedAnswers.length &&
      this.correctOptionIndexes.every((value, index) => value === selectedAnswers[index])) {
      this.isCorrect = true;
    }
  }

  resetCheckedAnswers() {
    for (const answer of this.checkedAnswers) {
      answer.checked = false;
    }
  }

  selectSingleAnswer(answerLabel: string) {
    this.selectedSingleAnswer = answerLabel;
  }

  submitAnswer(): void {
    const selectedAnswers: number[] = [];
    if (this.content.multiple) {
      for (let i = 0; i < this.checkedAnswers.length; i++) {
        if (this.checkedAnswers[i].checked) {
          selectedAnswers.push(i);
        }
      }
    } else {
      for (let i = 0; i < this.checkedAnswers.length; i++) {
        if (this.checkedAnswers[i].answerOption.label === this.selectedSingleAnswer) {
          selectedAnswers.push(i);
          break;
        }
      }
    }
    if (selectedAnswers.length === 0) {
      if (this.content.multiple) {
        this.translateService.get('answer.at-least-one').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
        });
      } else {
        this.translateService.get('answer.please-one').subscribe(message => {
          this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
        });
      }
      return;
    }
    this.answerService.addAnswerChoice(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      selectedChoiceIndexes: selectedAnswers,
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as ChoiceAnswer).subscribe(answer => {
      this.answer = answer;
      this.getCorrectAnswerOptions();
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.sendStatusToParent(answer);
    });
  }

  abstain() {
    this.answerService.addAnswerChoice(this.content.roomId, {
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      selectedChoiceIndexes: [],
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as ChoiceAnswer).subscribe(answer => {
      this.resetCheckedAnswers();
      this.hasAbstained = true;
      this.sendStatusToParent(answer);
    });
  }
}
