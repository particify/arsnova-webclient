import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { AnswerOption } from '@app/core/models/answer-option';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { AnswerForm } from '@app/participant/content/answer-form';
import {
  Answer,
  AnswerResultState,
  BinaryAnswerFormatData,
  BinaryContentFormatData,
  CreateQuestionnaireBinaryAnswerGql,
} from '@gql/generated/graphql';

/**
 * A binary content stores no options, so both labels come from i18n. They are
 * resolved in the participant's own language: unlike the projected results,
 * this form is read by one person on their own device.
 */
const BINARY_OPTION_KEYS = ['answer.yes', 'answer.no'];

/** The yes option comes first, so an answer of yes is the option at index 0. */
function answerOfOption(index: number): boolean {
  return index === 0;
}

@Component({
  selector: 'app-content-binary-participant',
  templateUrl: './content-binary-participant.component.html',
  imports: [ContentChoiceAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentBinaryParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly createAnswer = inject(CreateQuestionnaireBinaryAnswerGql);

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<BinaryContentFormatData>();
  readonly answerFormatData = input<BinaryAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly answerCreated = output<Answer>();

  readonly answered = computed(() => !!this.answerFormatData());

  readonly correctOptionIndexes = computed(() => {
    const correctAnswer = this.contentFormatData().correctAnswer;
    return correctAnswer === null || correctAnswer === undefined
      ? undefined
      : [correctAnswer ? 0 : 1];
  });

  /**
   * Follows the active language and waits for its file, so neither a switch
   * nor a slow load leaves the options showing stale labels or raw keys.
   */
  private readonly optionLabels = toSignal(
    this.translateService.selectTranslate<string[]>(BINARY_OPTION_KEYS),
    { initialValue: [] as string[] }
  );

  readonly answerOptions = linkedSignal<
    { answer?: boolean; labels: string[] },
    SelectableAnswer[]
  >({
    source: () => ({
      answer: this.answerFormatData()?.answer,
      labels: this.optionLabels(),
    }),
    computation: ({ answer, labels }, previous) => {
      // A new language only relabels the options; a choice not yet sent stays.
      const kept =
        previous &&
        previous.source.answer === answer &&
        previous.value.length === labels.length
          ? previous.value.map((option) => option.checked)
          : undefined;
      return labels.map(
        (label, index) =>
          new SelectableAnswer(
            new AnswerOption(label),
            kept ? kept[index] : answer === answerOfOption(index)
          )
      );
    },
  });

  submitAnswer(): void {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    const index = this.answerOptions().findIndex((option) => option.checked);
    if (index < 0) {
      this.notificationService.showAdvanced(
        this.translateService.translate('participant.answer.please-one'),
        AdvancedSnackBarTypes.WARNING
      );
      return;
    }
    this.createAnswer
      .mutate({ variables: { roundId, answer: answerOfOption(index) } })
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireBinaryAnswer;
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
}
