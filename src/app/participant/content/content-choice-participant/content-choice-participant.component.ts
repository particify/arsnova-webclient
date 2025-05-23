import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { ContentType } from '@app/core/models/content-type.enum';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ContentService } from '@app/core/services/http/content.service';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { take } from 'rxjs';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-choice-participant',
  templateUrl: './content-choice-participant.component.html',
  imports: [LoadingIndicatorComponent, ContentChoiceAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentChoiceParticipantComponent
  extends ContentParticipantBaseComponent
  implements OnChanges
{
  protected answerService = inject(ContentAnswerService);
  private contentService = inject(ContentService);

  @Input({ required: true }) content!: ContentChoice;
  @Input() answer?: ChoiceAnswer;
  @Input() statsPublished = false;
  @Input() correctOptionsPublished = false;
  @Input() language?: string;

  isLoading = true;
  ContentType: typeof ContentType = ContentType;
  selectedAnswerIndex?: number;
  selectableAnswers: SelectableAnswer[] = [];
  correctOptionIndexes: number[] = [];
  isCorrect = false;
  isChoice = false;
  hasAbstained = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.answer &&
      !changes.answer.currentValue &&
      !!changes.answer.previousValue
    ) {
      this.resetCheckedAnswers();
    }
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

  getCorrectAnswerOptions(sendResult = false) {
    if (this.correctOptionsPublished) {
      this.contentService
        .getCorrectChoiceIndexes(this.content.roomId, this.content.id)
        .subscribe((correctOptions) => {
          this.correctOptionIndexes = correctOptions.sort((a, b) => {
            return a < b ? -1 : 1;
          });
          (this.content as ContentChoice).correctOptionIndexes =
            this.correctOptionIndexes;
          this.checkIfCorrectAnswer();
          if (this.isChoice && this.answer) {
            this.checkAnswer(this.answer.selectedChoiceIndexes);
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
          if (sendResult) {
            this.sendStatusToParent(
              !this.isChoice
                ? AnswerResultType.NEUTRAL
                : this.isCorrect
                  ? AnswerResultType.CORRECT
                  : AnswerResultType.WRONG
            );
          }
        });
    } else {
      if (sendResult) {
        this.sendStatusToParent(AnswerResultType.NEUTRAL);
      }
      this.isLoading = false;
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
          .pipe(take(1))
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      } else {
        this.translateService
          .selectTranslate('participant.answer.please-one')
          .pipe(take(1))
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
    const answer = new ChoiceAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.CHOICE
    );
    answer.selectedChoiceIndexes = selectedAnswers;
    this.answerService.addAnswerChoice(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        this.getCorrectAnswerOptions(true);
        this.translateService
          .selectTranslate('participant.answer.sent')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
      },
      () => {
        this.enableForm();
      }
    );
  }

  abstain() {
    const answer = new ChoiceAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.CHOICE
    );
    this.answerService.addAnswerChoice(this.content.roomId, answer).subscribe(
      () => {
        this.resetCheckedAnswers();
        this.hasAbstained = true;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      () => {
        this.enableForm();
      }
    );
  }
}
