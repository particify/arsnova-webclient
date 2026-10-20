import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, switchMap } from 'rxjs';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  AnswerFragment,
  ContentFormatData,
  QuestionnaireAnswerByRoundIdGql,
  QuestionnaireTextAnswersByRoundIdDocument,
  QuestionnaireTextAnswersByRoundIdGql,
  QuestionnaireTextAnswersUpdatedGql,
  ToggleQuestionnaireTextAnswerHiddenGql,
} from '@gql/generated/graphql';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TextAnswerListComponent } from './text-answer-list/text-answer-list.component';
import { TextAnswerItem } from './text-answer-list/text-answer-item';

@Component({
  selector: 'app-text-results',
  templateUrl: './text-results.component.html',
  imports: [TextAnswerListComponent, TranslocoPipe],
})
export class TextResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly textAnswersByRoundId = inject(
    QuestionnaireTextAnswersByRoundIdGql
  );
  private readonly answerByRoundId = inject(QuestionnaireAnswerByRoundIdGql);
  private readonly textAnswersUpdated = inject(
    QuestionnaireTextAnswersUpdatedGql
  );
  private readonly toggleAnswerHidden = inject(
    ToggleQuestionnaireTextAnswerHiddenGql
  );
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();

  readonly formatData = input.required<ContentFormatData>();
  readonly roundIds = input.required<string[]>();
  private readonly roundId = computed(() => this.roundIds()[0]);
  readonly resultsVisible = input(true);
  readonly allowAnswerModeration = input(false);
  readonly viewAsParticipant = input(false);

  private readonly answersPublished = computed(() => {
    const formatData = this.formatData();
    return formatData.__typename === 'TextContentFormatData'
      ? !!formatData.answersPublished
      : false;
  });

  readonly restricted = computed(
    () => this.viewAsParticipant() && !this.answersPublished()
  );

  private readonly answers = toSignal(
    toObservable(
      computed(() => ({
        roundId: this.roundId(),
        restricted: this.restricted(),
      }))
    ).pipe(
      switchMap(({ roundId, restricted }) =>
        restricted ? this.ownAnswer(roundId) : this.allUnhiddenAnswers(roundId)
      )
    ),
    { initialValue: [] as AnswerFragment[] }
  );

  private allUnhiddenAnswers(roundId?: string): Observable<AnswerFragment[]> {
    if (!roundId) {
      return of([]);
    }
    return updateRoundOn(
      this.apollo.client,
      this.textAnswersByRoundId.watch({
        variables: { roundId },
        fetchPolicy: 'cache-and-network',
      }),
      this.textAnswersUpdated.subscribe({ variables: { roundId } }),
      (r) =>
        r.data && {
          questionnaireTextAnswersByRoundId:
            r.data.questionnaireTextAnswersUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      // Moderating readers receive hidden answers as well.
      map((r) =>
        (r.data?.questionnaireTextAnswersByRoundId ?? []).filter(
          (answer) => !answer.hidden
        )
      )
    );
  }

  private ownAnswer(roundId?: string): Observable<AnswerFragment[]> {
    if (!roundId) {
      return of([]);
    }
    return this.answerByRoundId
      .watch({ variables: { roundId } })
      .valueChanges.pipe(
        onlyCompleteData(),
        map((r) => {
          const answer = r.data?.questionnaireAnswerByRoundId;
          return answer && !answer.hidden ? [answer] : [];
        })
      );
  }

  readonly listData = computed<TextAnswerItem[]>(() =>
    this.answers().flatMap((answer) => {
      const formatData = answer.formatData;
      const body =
        formatData?.__typename === 'TextAnswerFormatData'
          ? (formatData.body ?? '')
          : '';
      return body ? [{ id: answer.id, body }] : [];
    })
  );

  readonly hasAnswers = computed(() => this.listData().length > 0);

  hideAnswer(answer: TextAnswerItem) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'text-answer',
      'creator.dialog.really-delete-answer',
      answer.body,
      undefined,
      () =>
        this.toggleAnswerHidden
          .mutate({
            variables: { answerId: answer.id, hidden: true },
            refetchQueries: [
              {
                query: QuestionnaireTextAnswersByRoundIdDocument,
                variables: { roundId: this.roundId() },
              },
            ],
          })
          .pipe(this.mutations.reportErrors())
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.statistic.answer-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }
}
