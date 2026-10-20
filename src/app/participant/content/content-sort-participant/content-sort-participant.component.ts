import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  untracked,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AnswerForm } from '@app/participant/content/answer-form';
import {
  ContentSortAnswerComponent,
  SortItem,
} from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireSortAnswerGql,
  SortAnswerFormatData,
  SortContentFormatData,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

@Component({
  selector: 'app-content-sort-participant',
  templateUrl: './content-sort-participant.component.html',
  imports: [ContentSortAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentSortParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly answerService = inject(ContentAnswerService);
  private readonly createAnswer = inject(CreateQuestionnaireSortAnswerGql);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<SortContentFormatData>();
  readonly answerFormatData = input<SortAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly answerCreated = output<Answer>();

  /**
   * Only a real change to the items or to the given answer may reseed the list:
   * an unrelated re-emit would otherwise draw a new shuffle and discard the
   * order the participant has dragged into place.
   */
  private readonly seed = computed(() =>
    JSON.stringify([
      this.contentFormatData().options.map((option) => option.label),
      this.answerFormatData()?.selectedChoiceIndexes ?? null,
    ])
  );

  readonly displayOptions = linkedSignal<string, SortItem[]>({
    source: this.seed,
    computation: () => untracked(() => this.arrangeOptions()),
  });

  readonly answered = computed(() => !!this.answerFormatData());

  /** The server scored the answer; the order is never compared here. */
  readonly correct = computed(() =>
    this.answered() && this.correctOptionsPublished()
      ? this.result() === AnswerResultState.Correct
      : undefined
  );

  submitAnswer(): void {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    this.createAnswer
      .mutate({
        variables: {
          roundId,
          selectedChoiceIndexes: this.selectedChoiceIndexes(),
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireSortAnswer;
          if (answer) this.answerCreated.emit(answer as Answer);
          const msg = this.translateService.translate(
            'participant.answer.sent'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
      });
  }

  /**
   * Answering starts from a shuffle of its own, whatever order the items are
   * stored in; a given answer is put back in the order it was given instead.
   */
  private arrangeOptions(): SortItem[] {
    const options = this.contentFormatData().options;
    const given = this.answerFormatData()?.selectedChoiceIndexes;
    return given
      ? given.map((index) => options[index])
      : this.answerService.shuffleAnswerOptions([...options]);
  }

  /** The displayed order, expressed as positions in the stored option order. */
  private selectedChoiceIndexes(): number[] {
    const labels = this.contentFormatData().options.map(
      (option) => option.label
    );
    return this.displayOptions().map((option) => labels.indexOf(option.label));
  }
}
