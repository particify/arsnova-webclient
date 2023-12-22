import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { TranslocoService } from '@ngneat/transloco';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentParticipantBaseComponent } from '@app/participant/content/content-participant-base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ContentService } from '@app/core/services/http/content.service';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-content-sort-participant',
  templateUrl: './content-sort-participant.component.html',
  styleUrls: ['./content-sort-participant.component.scss'],
})
export class ContentSortParticipantComponent extends ContentParticipantBaseComponent {
  @Input({ required: true }) content!: ContentChoice;
  @Input({ required: true }) answer!: ChoiceAnswer;
  @Input() statsPublished = false;
  @Input() correctOptionsPublished = false;
  @Output() answerChanged = new EventEmitter<ChoiceAnswer>();

  isLoading = true;
  hasAbstained = false;
  isCorrect: boolean | undefined;
  correctOptionIndexes: number[] = [];
  answerOptions: AnswerOption[] = [];

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
    if (this.answer) {
      this.isDisabled = true;
      if (this.answer.selectedChoiceIndexes) {
        this.setSortOfAnswer(this.answer.selectedChoiceIndexes);
        this.checkIfCorrect();
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

  checkIfCorrect() {
    if (this.correctOptionsPublished) {
      this.contentService
        .getCorrectChoiceIndexes(this.content.roomId, this.content.id)
        .subscribe((correctOptions) => {
          this.correctOptionIndexes = correctOptions;
          (this.content as ContentChoice).correctOptionIndexes =
            this.correctOptionIndexes;
          this.isCorrect =
            this.answer.selectedChoiceIndexes.toString() ===
            this.correctOptionIndexes.toString();
          this.isLoading = false;
        });
    }
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
        this.checkIfCorrect();
        this.translateService
          .selectTranslate('participant.answer.sent')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.sendStatusToParent(answer);
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
    this.answerService
      .addAnswerChoice(this.content.roomId, answer)
      .subscribe((answer) => {
        this.hasAbstained = true;
        this.sendStatusToParent(answer);
      }),
      () => {
        this.enableForm();
      };
  }
}
