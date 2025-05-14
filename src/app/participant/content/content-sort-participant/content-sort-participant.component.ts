import { Component, Input, inject } from '@angular/core';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { provideTranslocoScope } from '@jsverse/transloco';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ContentService } from '@app/core/services/http/content.service';
import { take } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass } from '@angular/common';
import { AnswerResultType } from '@app/core/models/answer-result';

@Component({
  selector: 'app-content-sort-participant',
  templateUrl: './content-sort-participant.component.html',
  styleUrls: ['./content-sort-participant.component.scss'],
  imports: [
    LoadingIndicatorComponent,
    ContentSortAnswerComponent,
    NgClass,
    MatIcon,
  ],
  providers: [provideTranslocoScope('participant')],
})
export class ContentSortParticipantComponent extends ContentParticipantBaseComponent {
  protected answerService = inject(ContentAnswerService);
  private contentService = inject(ContentService);

  @Input({ required: true }) content!: ContentChoice;
  @Input() answer?: ChoiceAnswer;
  @Input() correctOptionsPublished = false;

  isLoading = true;
  hasAbstained = false;
  isCorrect: boolean | undefined;
  correctOptionIndexes: number[] = [];
  answerOptions: AnswerOption[] = [];

  init() {
    if (this.answer) {
      this.isDisabled = true;
      if (this.answer.selectedChoiceIndexes) {
        this.setSortOfAnswer(this.answer.selectedChoiceIndexes);
        if (this.correctOptionsPublished) {
          this.checkIfCorrect();
        } else {
          this.isLoading = false;
        }
      } else {
        this.hasAbstained = true;
        this.initAnswers();
      }
    } else {
      this.initAnswers();
    }
  }

  initAnswers() {
    this.answerOptions = this.answerService.shuffleAnswerOptions(
      JSON.parse(JSON.stringify(this.content.options))
    );
    this.isLoading = false;
  }

  checkIfCorrect(sendStatus = false) {
    this.contentService
      .getCorrectChoiceIndexes(this.content.roomId, this.content.id)
      .subscribe((correctOptions) => {
        this.correctOptionIndexes = correctOptions;
        (this.content as ContentChoice).correctOptionIndexes =
          this.correctOptionIndexes;
        this.isCorrect =
          this.answer &&
          this.answer.selectedChoiceIndexes.toString() ===
            this.correctOptionIndexes.toString();
        if (sendStatus) {
          this.sendStatusToParent(
            this.isCorrect ? AnswerResultType.CORRECT : AnswerResultType.WRONG
          );
        }
        this.isLoading = false;
      });
  }

  setSortOfAnswer(sorting: number[]) {
    for (let i = 0; i < sorting.length; i++) {
      this.answerOptions[i] = this.content.options[sorting[i]];
    }
  }

  setSorting(): number[] {
    const selectedSorting: number[] = [];
    for (const [index, answer] of this.answerOptions.entries()) {
      selectedSorting[index] = this.content.options
        .map((a) => a.label)
        .indexOf(answer.label);
    }
    return selectedSorting;
  }

  submitAnswer() {
    this.disableForm();
    const answer = new ChoiceAnswer(
      this.content.id,
      this.content.state.round,
      ContentType.SORT
    );
    answer.selectedChoiceIndexes = this.setSorting();
    this.answerService.addAnswerChoice(this.content.roomId, answer).subscribe(
      (answer) => {
        this.answer = answer;
        if (this.correctOptionsPublished) {
          this.checkIfCorrect(true);
        } else {
          this.sendStatusToParent(AnswerResultType.NEUTRAL);
        }
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
      ContentType.SORT
    );
    this.answerService.addAnswerChoice(this.content.roomId, answer).subscribe(
      () => {
        this.hasAbstained = true;
        this.sendStatusToParent(AnswerResultType.ABSTAINED);
      },
      () => {
        this.enableForm();
      }
    );
  }
}
