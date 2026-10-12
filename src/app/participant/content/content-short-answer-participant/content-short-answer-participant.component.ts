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
import {
  provideTranslocoScope,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { FlexModule } from '@angular/flex-layout';
import { ContentTextAnswerComponent } from '@app/standalone/content-answers/content-text-answer/content-text-answer.component';
import { AnswerForm } from '@app/participant/content/answer-form';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnaireShortAnswerAnswerGql,
  ShortAnswerAnswerFormatData,
  ShortAnswerContentFormatData,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

const TERM_LENGTH_LIMIT = 80;

@Component({
  selector: 'app-content-short-answer-participant',
  templateUrl: './content-short-answer-participant.component.html',
  styleUrl: './content-short-answer-participant.component.scss',
  imports: [ContentTextAnswerComponent, FlexModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentShortAnswerParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();
  private readonly createAnswer = inject(
    CreateQuestionnaireShortAnswerAnswerGql
  );

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData = input.required<ShortAnswerContentFormatData>();
  readonly answerFormatData = input<ShortAnswerAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly answerCreated = output<Answer>();

  readonly lengthLimit = TERM_LENGTH_LIMIT;

  readonly answer = linkedSignal(() => this.answerFormatData()?.body ?? '');
  readonly answered = computed(() => !!this.answerFormatData());

  /** The server scored the answer; the terms are never compared here. */
  readonly correct = computed(() =>
    this.answered() && this.correctOptionsPublished()
      ? this.result() === AnswerResultState.Correct
      : undefined
  );

  readonly correctTerms = computed(() =>
    this.answered() && this.correctOptionsPublished()
      ? this.contentFormatData().correctTerms
      : []
  );

  submitAnswer(): void {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    const body = this.answer().trim();
    if (!body) {
      this.notificationService.showAdvanced(
        this.translateService.translate('participant.answer.please-answer'),
        AdvancedSnackBarTypes.WARNING
      );
      return;
    }
    this.createAnswer
      .mutate({ variables: { roundId, body } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnaireShortAnswerAnswer;
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
