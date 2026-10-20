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
import { AnswerForm } from '@app/participant/content/answer-form';
import { ContentPrioritizationAnswerComponent } from '@app/standalone/content-answers/content-prioritization-answer/content-prioritization-answer.component';
import {
  Answer,
  AnswerResultState,
  CreateQuestionnairePrioritizationAnswerGql,
  PrioritizationAnswerFormatData,
  PrioritizationContentFormatData,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

@Component({
  selector: 'app-content-prioritization-participant',
  templateUrl: './content-prioritization-participant.component.html',
  imports: [ContentPrioritizationAnswerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class ContentPrioritizationParticipantComponent implements AnswerForm {
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();
  private readonly createAnswer = inject(
    CreateQuestionnairePrioritizationAnswerGql
  );

  readonly contentId = input.required<string>();
  readonly roundId = input<string>();
  readonly contentFormatData =
    input.required<PrioritizationContentFormatData>();
  readonly answerFormatData = input<PrioritizationAnswerFormatData>();
  readonly result = input<AnswerResultState | undefined>(
    AnswerResultState.Unanswered
  );
  readonly correctOptionsPublished = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly answerCreated = output<Answer>();

  readonly items = computed(() => this.contentFormatData().options);
  readonly answered = computed(() => !!this.answerFormatData());

  /**
   * Only a real change to the items or to the given answer may reseed the
   * points: an unrelated re-emit would otherwise discard what the participant
   * has just distributed.
   */
  private readonly seed = computed(() =>
    JSON.stringify([
      this.contentFormatData().options.map((option) => option.label),
      this.answerFormatData()?.assignedPoints ?? null,
    ])
  );

  readonly assignedPoints = linkedSignal<string, number[]>({
    source: this.seed,
    computation: () =>
      untracked(
        () =>
          this.answerFormatData()?.assignedPoints ??
          this.contentFormatData().options.map(() => 0)
      ),
  });

  submitAnswer(): void {
    const roundId = this.roundId();
    if (!roundId) {
      return;
    }
    const assignablePoints = this.contentFormatData().assignablePoints;
    const assignedPoints = this.assignedPoints();
    const total = assignedPoints.reduce((sum, points) => sum + points, 0);
    if (total !== assignablePoints) {
      this.warn(
        'participant.answer.please-assign-points-correctly',
        assignablePoints
      );
      return;
    }
    if (
      assignedPoints.some((points) => points < 0 || points > assignablePoints)
    ) {
      this.warn(
        'participant.answer.please-assign-valid-points',
        assignablePoints
      );
      return;
    }
    this.createAnswer
      .mutate({ variables: { roundId, assignedPoints } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: (r) => {
          const answer = r.data?.createQuestionnairePrioritizationAnswer;
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

  private warn(key: string, points: number) {
    this.notificationService.showAdvanced(
      this.translateService.translate(key, { points }),
      AdvancedSnackBarTypes.WARNING
    );
  }
}
