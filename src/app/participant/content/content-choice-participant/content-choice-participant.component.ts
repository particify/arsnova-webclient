import {
  Component,
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
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { toAnswerOption } from '@app/core/models/answer-option';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import {
  Answer,
  AnswerResultState,
  ChoiceAnswerFormatData,
  ChoiceContentFormatData,
  CreateQuestionnaireChoiceAnswerGql,
} from '@gql/generated/graphql';
import { AnswerForm } from '@app/participant/content/answer-form';
import { mutationHelper } from '@gql/helper/mutation-helper';

@Component({
  selector: 'app-content-choice-participant',
  templateUrl: './content-choice-participant.component.html',
  imports: [ContentChoiceAnswerComponent],
  providers: [provideTranslocoScope('participant')],
})
export class ContentChoiceParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly createAnswer = inject(CreateQuestionnaireChoiceAnswerGql);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<ChoiceContentFormatData>();
  readonly answerFormatData = input<ChoiceAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly answerCreated = output<Answer>();
  readonly language = input<string | undefined>();

  readonly answerOptions = linkedSignal(() =>
    this.contentFormatData().options.map(
      (o, i) =>
        new SelectableAnswer(
          toAnswerOption(o),
          !!this.answerFormatData()?.selectedChoiceIndexes.includes(i)
        )
    )
  );

  readonly answerOptionsWithAnswer = computed(() => {
    const answer = this.answerFormatData();
    if (answer) {
      return this.answerOptions().map((o, i) => {
        if (answer.selectedChoiceIndexes.includes(i)) {
          o.checked = true;
        }
        return o;
      });
    }
    return this.answerOptions();
  });

  submitAnswer(): void {
    const roundId = this.roundId();
    if (roundId) {
      const selectedChoiceIndexes = this.answerOptions().flatMap((o, i) =>
        o.checked ? [i] : []
      );
      if (selectedChoiceIndexes.length === 0) {
        const msg = this.translateService.translate(
          this.contentFormatData().multiple
            ? 'participant.answer.at-least-one'
            : 'participant.answer.please-one'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );

        return;
      }
      this.createAnswer
        .mutate({
          variables: { input: { roundId, selectedChoiceIndexes } },
        })
        .pipe(this.mutations.handleErrors())
        .subscribe({
          next: (r) => {
            const answer = r.data?.createQuestionnaireChoiceAnswer;
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
}
