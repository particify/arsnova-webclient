import {
  ChangeDetectionStrategy,
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
import { AnswerOption } from '@app/core/models/answer-option';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { AnswerForm } from '@app/participant/content/answer-form';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireScaleAnswerGql,
  ScaleAnswerFormatData,
  ScaleContentFormatData,
  ScaleContentTemplate,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-content-scale-participant',
  templateUrl: './content-scale-participant.component.html',
  imports: [ContentChoiceAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentScaleParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly likertScaleService = inject(LikertScaleService);
  private readonly createAnswer = inject(CreateQuestionnaireScaleAnswerGql);

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<ScaleContentFormatData>();
  readonly answerFormatData = input<ScaleAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly language = input<string>();
  readonly answerCreated = output<Answer>();

  readonly answered = computed(() => !!this.answerFormatData());

  private readonly options = computed(() =>
    this.likertScaleService.getOptions(
      this.contentFormatData().template ?? ScaleContentTemplate.Agreement,
      this.contentFormatData().neutralOption ?? true
    )
  );
  /** Keys go to the answer component, which translates them into the room's language. */
  readonly translateLabels = computed(() => this.options().translate);

  readonly answerOptions = linkedSignal(() => {
    const rating = this.answerFormatData()?.rating;
    return this.options().labels.map(
      (label, index) =>
        new SelectableAnswer(new AnswerOption(label), rating === index)
    );
  });

  submitAnswer(): void {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    const rating = this.answerOptions().findIndex((option) => option.checked);
    if (rating < 0) {
      this.notificationService.showAdvanced(
        this.translateService.translate('participant.answer.please-one'),
        AdvancedSnackBarTypes.WARNING
      );
      return;
    }
    this.createAnswer.mutate({ variables: { roundId, rating } }).subscribe({
      next: (r) => {
        const answer = r.data?.createQuestionnaireScaleAnswer;
        if (answer) this.answerCreated.emit(answer as Answer);
        const msg = this.translateService.translate('participant.answer.sent');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      },
    });
  }
}
