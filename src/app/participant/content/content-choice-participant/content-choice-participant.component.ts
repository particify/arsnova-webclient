import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { ContentType } from '@app/core/models/content-type.enum';
import { TranslocoService } from '@ngneat/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ContentService } from '@app/core/services/http/content.service';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-choice-participant',
  templateUrl: './content-choice-participant.component.html',
})
export class ContentChoiceParticipantComponent extends ContentParticipantBaseComponent {
  @Input() content: ContentChoice;
  @Input() answer: ChoiceAnswer;
  @Input() statsPublished: boolean;
  @Input() correctOptionsPublished: boolean;
  @Output() answerChanged = new EventEmitter<ChoiceAnswer>();

  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  selectedAnswerIndex?: number;
  selectableAnswers: SelectableAnswer[] = [];
  correctOptionIndexes: number[] = [];
  isCorrect = false;
  isChoice = false;
  hasAbstained = false;
  shortId: string;
  multipleAlreadyAnswered = '';
  allAnswers = '';

  constructor(
    protected answerService: ContentAnswerService,
    protected notificationService: NotificationService,
    protected translateService: TranslocoService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    private contentService: ContentService,
    protected formService: FormService
  ) {
    super(
      notificationService,
      translateService,
      route,
      globalStorageService,
      router,
      formService
    );
  }

  init() {
    for (const answerOption of this.content.options) {
      this.selectableAnswers.push(new SelectableAnswer(answerOption, false));
    }
    if (this.answer) {
      if (
        this.answer.selectedChoiceIndexes &&
        this.answer.selectedChoiceIndexes.length > 0
      ) {
        for (const i of this.answer.selectedChoiceIndexes) {
          this.selectableAnswers[i].checked = true;
          this.multipleAlreadyAnswered +=
            this.selectableAnswers[i].answerOption.label + '&';
          if (!this.content.multiple) {
            this.selectedAnswerIndex = this.answer.selectedChoiceIndexes[0];
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
      this.contentService
        .getCorrectChoiceIndexes(this.content.roomId, this.content.id)
        .subscribe((correctOptions) => {
          this.correctOptionIndexes = correctOptions.sort((a, b) => {
            return a < b ? -1 : 1;
          });
          (this.content as ContentChoice).correctOptionIndexes =
            this.correctOptionIndexes;
          this.getCorrectAnswer();
          if (this.isChoice) {
            this.checkAnswer(this.answer.selectedChoiceIndexes);
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
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
    if (
      this.correctOptionIndexes.length === selectedAnswers.length &&
      this.correctOptionIndexes.every(
        (value, index) => value === selectedAnswers[index]
      )
    ) {
      this.isCorrect = true;
    }
  }

  resetCheckedAnswers() {
    for (const answer of this.selectableAnswers) {
      answer.checked = false;
    }
    this.setAnswerIndex(undefined);
  }

  setAnswerIndex(index?: number) {
    this.selectedAnswerIndex = index;
  }

  submitAnswer(): void {
    const selectedAnswers: number[] = [];
    if (this.content.multiple) {
      for (let i = 0; i < this.selectableAnswers.length; i++) {
        if (this.selectableAnswers[i].checked) {
          selectedAnswers.push(i);
        }
      }
    } else {
      for (let i = 0; i < this.selectableAnswers.length; i++) {
        if (i === this.selectedAnswerIndex) {
          selectedAnswers.push(i);
          break;
        }
      }
    }
    if (selectedAnswers.length === 0) {
      if (this.content.multiple) {
        this.translateService
          .selectTranslate('participant.answer.at-least-one')
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      } else {
        this.translateService
          .selectTranslate('participant.answer.please-one')
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      }
      return;
    }
    this.disableForm();
    const answer = new ChoiceAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.selectedChoiceIndexes = selectedAnswers;
    answer.format = ContentType.CHOICE;
    this.answerService
      .addAnswerChoice(this.content.roomId, answer)
      .subscribe((answer) => {
        this.answer = answer;
        this.getCorrectAnswerOptions();
        this.translateService
          .selectTranslate('participant.answer.sent')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }

  abstain() {
    const answer = new ChoiceAnswer();
    answer.contentId = this.content.id;
    answer.round = this.content.state.round;
    answer.format = ContentType.CHOICE;
    this.answerService
      .addAnswerChoice(this.content.roomId, answer)
      .subscribe((answer) => {
        this.resetCheckedAnswers();
        this.hasAbstained = true;
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
