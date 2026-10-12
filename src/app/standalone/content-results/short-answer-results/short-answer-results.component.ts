import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { updateOn } from '@gql/helper/update-on';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { TextStatistic } from '@app/core/models/text-statistic';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
  BanQuestionnaireShortAnswerContentKeywordGql,
  QuestionnaireShortAnswerRoundStatsByRoundIdGql,
  QuestionnaireShortAnswerRoundStatsUpdatedGql,
  ShortAnswerContentFormatData,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-short-answer-results',
  templateUrl: './short-answer-results.component.html',
  imports: [
    AnswerGridListComponent,
    AnswerListComponent,
    CorrectAnswerResultsComponent,
    CoreModule,
  ],
})
export class ShortAnswerResultsComponent {
  private readonly roundStatsByRoundId = inject(
    QuestionnaireShortAnswerRoundStatsByRoundIdGql
  );
  private readonly roundStatsUpdated = inject(
    QuestionnaireShortAnswerRoundStatsUpdatedGql
  );
  private readonly banKeyword = inject(
    BanQuestionnaireShortAnswerContentKeywordGql
  );
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);

  readonly contentId = input.required<string>();
  readonly roundIds = input.required<string[]>();
  readonly formatData = input.required<ShortAnswerContentFormatData>();
  readonly hasCorrectAnswer = input(false);
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly isPresentation = input(false);
  readonly answerCount = input(0);
  readonly correctAnswerCount = input(0);
  readonly abstentionCount = input(0);
  readonly allowAnswerModeration = input(false);

  private readonly roundId = computed(() => this.roundIds()[0]);

  readonly roundStats = toSignal(
    toObservable(this.roundId).pipe(
      switchMap((roundId) => {
        // Nothing to show until the content has a round.
        if (!roundId) {
          return of(undefined);
        }
        return updateOn(
          this.roundStatsByRoundId.watch({ variables: { roundId } }),
          this.roundStatsUpdated.subscribe({ variables: { roundId } }),
          (r) =>
            r.data && {
              questionnaireShortAnswerRoundStatsByRoundId:
                r.data.questionnaireShortAnswerRoundStatsUpdated,
            }
        ).pipe(
          onlyCompleteData(),
          map((r) => r.data?.questionnaireShortAnswerRoundStatsByRoundId)
        );
      })
    )
  );

  readonly answers = computed(() => {
    const roundStats = this.roundStats();
    return (roundStats?.texts ?? []).map(
      (text, i) => new TextStatistic(text, roundStats?.counts?.[i] ?? 0)
    );
  });

  readonly hasAnswers = computed(() => this.answers().length > 0);

  readonly correctTerms = computed(() => this.formatData().correctTerms);

  readonly showModeration = computed(
    () => this.allowAnswerModeration() && !this.isPresentation()
  );

  banAnswer(keyword: string) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'ban-answer',
      'creator.dialog.really-ban-answer',
      keyword,
      'creator.dialog.ban',
      () =>
        this.banKeyword.mutate({
          variables: { contentId: this.contentId(), keyword },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.statistic.answer-banned'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }
}
