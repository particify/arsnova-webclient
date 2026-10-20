import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  BanQuestionnaireWordcloudContentKeywordGql,
  QuestionnaireWordcloudRoundStatsByRoundIdGql,
  QuestionnaireWordcloudRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { map, switchMap, of } from 'rxjs';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { ThemeService } from '@app/core/theme/theme.service';
import { CoreModule } from '@app/core/core.module';
import { WordcloudComponent } from '@app/standalone/content-results/visualization/wordcloud/wordcloud.component';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { VisualizationType } from '@app/standalone/content-results/visualization/visualization-type';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';

@Component({
  selector: 'app-wordcloud-results',
  templateUrl: './wordcloud-results.component.html',
  imports: [
    CoreModule,
    WordcloudComponent,
    AnswerListComponent,
    AnswerGridListComponent,
    TranslocoPipe,
  ],
})
export class WordcloudResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly themeService = inject(ThemeService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireWordcloudRoundStatsByRoundIdGql
  );
  private readonly banKeyword = inject(
    BanQuestionnaireWordcloudContentKeywordGql
  );
  private readonly wordcloudRoundStatsUpdated = inject(
    QuestionnaireWordcloudRoundStatsUpdatedGql
  );
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();

  readonly contentId = input.required<string>();
  readonly roundIds = input.required<string[]>();
  private readonly roundId = computed(() => this.roundIds()[0]);
  readonly resultsVisible = input(true);
  readonly rotateWords = input(false);
  readonly visualizationType = input(VisualizationType.WORDCLOUD);
  readonly allowAnswerModeration = input(false);
  readonly roundStats = toSignal(
    toObservable(this.roundId).pipe(
      switchMap((roundId) => {
        // A content without a round yet has no stats to load.
        if (!roundId) {
          return of(undefined);
        }
        return updateRoundOn(
          this.apollo.client,
          this.roundStatsByRoundId.watch({
            variables: { roundId },
            fetchPolicy: 'cache-and-network',
          }),
          this.wordcloudRoundStatsUpdated.subscribe({ variables: { roundId } }),
          (r) =>
            r.data && {
              questionnaireWordcloudRoundStatsByRoundId:
                r.data.questionnaireWordcloudRoundStatsUpdated,
            }
        ).pipe(
          onlyCompleteData(),
          map((r) => r.data?.questionnaireWordcloudRoundStatsByRoundId)
        );
      })
    )
  );

  readonly hasAnswers = computed(() => !!this.roundStats()?.words?.length);

  readonly visualizationData = computed(() => ({
    labels: this.roundStats()?.words ?? [],
    datasets: [
      {
        values: this.roundStats()?.counts ?? [],
        colors: this.themeService.getAltTextColors(),
      },
    ],
  }));

  readonly listData = computed(() => {
    const roundStats = this.roundStats();
    if (roundStats) {
      return roundStats.words?.map((w, i) => ({
        answer: w,
        count: roundStats.counts ? roundStats.counts[i] : 0,
      }));
    }
    return [];
  });

  VisualizationType = VisualizationType;

  banAnswer(keyword: string) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'ban-answer',
      'creator.dialog.really-ban-answer',
      keyword,
      'creator.dialog.ban',
      () =>
        this.banKeyword
          .mutate({
            variables: { contentId: this.contentId(), keyword },
          })
          .pipe(this.mutations.reportErrors())
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
