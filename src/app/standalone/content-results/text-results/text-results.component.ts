import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of, switchMap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { updateOn } from '@gql/helper/update-on';
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
    return updateOn(
      this.textAnswersByRoundId.watch({ variables: { roundId } }),
      this.textAnswersUpdated.subscribe({ variables: { roundId } }),
      (r) =>
        r.data && {
          questionnaireTextAnswersByRoundId:
            r.data.questionnaireTextAnswersUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireTextAnswersByRoundId ?? [])
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
        this.toggleAnswerHidden.mutate({
          variables: { answerId: answer.id, hidden: true },
          refetchQueries: [
            {
              query: QuestionnaireTextAnswersByRoundIdDocument,
              variables: { roundId: this.roundId() },
            },
          ],
        })
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
