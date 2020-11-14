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
import { ContentParticipantComponent } from '../content-participant.component';

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
export class ContentChoiceParticipantComponent extends ContentParticipantComponent implements OnInit {

  @Input() content: ContentChoice;
  @Input() answer: ChoiceAnswer;
  @Output() message = new EventEmitter<ChoiceAnswer>();

  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  selectedSingleAnswer: string;
  checkedAnswers: CheckedAnswer[] = [];
  correctOptionIndexes: number[] = [];
  isCorrect = false;
  isChoice = true;
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
    protected router: Router
  ) {
    super(authenticationService, notificationService, translateService, langService, route, globalStorageService, router);
  }

  initAnswer(userId: string) {
    this.setExtensionData(this.content.roomId, this.content.id);
    for (const answerOption of this.content.options) {
      this.checkedAnswers.push(new CheckedAnswer(answerOption, false));
    }
    this.getCorrectAnswer();
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
          if (this.isChoice) {
            this.checkAnswer(this.answer.selectedChoiceIndexes);
          }
        } else {
          this.hasAbstained = true;
        }
        this.alreadySent = true;
      }
      this.isLoading = false;
  }

  getCorrectAnswer() {
    const maxPoints = Math.max.apply(Math, this.content.options.map(function(option) { return option.points; }));
    if (this.content.format === ContentType.SCALE || maxPoints <= 0) {
      this.isChoice = false;
    } else {
      for (const i in this.content.options) {
        if (this.content.options[i]) {
          this.allAnswers += this.content.options[i].label + '&';
          if (this.content.options[i].points > 0) {
            this.correctOptionIndexes.push(Number(i));
          }
        }
      }
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
    this.answerService.addAnswerChoice({
      id: null,
      revision: null,
      contentId: this.content.id,
      round: this.content.state.round,
      selectedChoiceIndexes: selectedAnswers,
      creationTimestamp: null,
      format: ContentType.CHOICE
    } as ChoiceAnswer).subscribe(answer => {
      if (this.isChoice) {
        this.checkAnswer(selectedAnswers);
      }
      this.translateService.get('answer.sent').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
      this.alreadySent = true;
      this.sendStatusToParent(answer);
    });
  }

  abstain($event) {
    $event.preventDefault();
    this.answerService.addAnswerChoice({
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
      this.alreadySent = true;
      this.sendStatusToParent(answer);
    });
  }
}
