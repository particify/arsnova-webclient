import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { provideTranslocoScope, TranslocoService } from '@jsverse/transloco';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireNumericAnswerGql,
  NumericAnswerFormatData,
  NumericContentFormatData,
} from '@gql/generated/graphql';
import { AnswerForm } from '@app/participant/content/answer-form';

@Component({
  selector: 'app-content-numeric-participant',
  templateUrl: './content-numeric-participant.component.html',
  imports: [ContentNumericAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentNumericParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly createAnswer = inject(CreateQuestionnaireNumericAnswerGql);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<NumericContentFormatData>();
  readonly answerFormatData = input<NumericAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly answerCreated = output<Answer>();

  readonly selectedNumber = linkedSignal<number | undefined>(
    () => this.answerFormatData()?.selectedNumber
  );
  readonly answered = computed(() => !!this.answerFormatData());

  submitAnswer() {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    const selectedNumber = this.selectedNumber();
    if (selectedNumber === undefined || selectedNumber === null) {
      this.warn('participant.answer.please-answer');
      return;
    }
    if (
      selectedNumber < this.contentFormatData().minNumber ||
      selectedNumber > this.contentFormatData().maxNumber
    ) {
      this.warn('participant.answer.please-select-number-from-range');
      return;
    }
    this.createAnswer
      .mutate({ variables: { roundId, selectedNumber } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireNumericAnswer;
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

  private warn(key: string) {
    this.notificationService.showAdvanced(
      this.translateService.translate(key),
      AdvancedSnackBarTypes.WARNING
    );
  }
}
