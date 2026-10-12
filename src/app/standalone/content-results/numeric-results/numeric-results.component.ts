import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { updateOn } from '@gql/helper/update-on';
import { TranslocoService } from '@jsverse/transloco';
import {
  NumericContentFormatData,
  NumericContentRoundStats,
  QuestionnaireNumericRoundStatsByRoundIdGql,
  QuestionnaireNumericRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { CoreModule } from '@app/core/core.module';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import { StatisticInfoComponent } from '@app/standalone/statistic-info/statistic-info.component';
import {
  formatGroupLabel,
  groupAnswerResults,
  groupTooltipTitles,
} from './answer-grouping';

type NumericStat = keyof Pick<
  NumericContentRoundStats,
  'mean' | 'median' | 'standardDeviation' | 'variance' | 'minimum' | 'maximum'
>;

@Component({
  selector: 'app-numeric-results',
  templateUrl: './numeric-results.component.html',
  styleUrls: ['./numeric-results.component.scss'],
  imports: [
    CoreModule,
    BarChartComponent,
    CorrectAnswerResultsComponent,
    StatisticInfoComponent,
  ],
})
export class NumericResultsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly presentationService = inject(PresentationService);
  private readonly translateService = inject(TranslocoService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireNumericRoundStatsByRoundIdGql
  );
  private readonly numericRoundStatsUpdated = inject(
    QuestionnaireNumericRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
  readonly rounds = input.required<Round[]>();
  readonly formatData = input.required<NumericContentFormatData>();
  readonly hasCorrectAnswer = input(false);
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly answerCount = input(0);
  readonly correctAnswerCount = input(0);
  readonly abstentionCount = input(0);

  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.scale() : 1
  );

  private statsForRound(
    roundId: string
  ): Observable<NumericContentRoundStats | null | undefined> {
    return updateOn(
      this.roundStatsByRoundId.watch({ variables: { roundId } }),
      this.numericRoundStatsUpdated.subscribe({ variables: { roundId } }),
      (r) =>
        r.data && {
          questionnaireNumericRoundStatsByRoundId:
            r.data.questionnaireNumericRoundStatsUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireNumericRoundStatsByRoundId)
    );
  }

  readonly roundStatsList = toSignal(
    toObservable(this.roundIds).pipe(
      switchMap((roundIds) =>
        roundIds.length
          ? combineLatest(
              roundIds.map((roundId) => this.statsForRound(roundId))
            )
          : of([])
      )
    )
  );

  readonly comparingRounds = computed(() => this.roundIds().length > 1);

  /** Bounds depend only on the configured range, so all rounds share them. */
  private readonly groupsPerRound = computed(() => {
    const stats = this.roundStatsList() ?? [];
    return this.roundIds().map((_, i) =>
      groupAnswerResults(
        this.formatData().minNumber,
        this.formatData().maxNumber,
        stats[i]?.selectedNumbers ?? [],
        stats[i]?.counts ?? []
      )
    );
  });

  /**
   * One series, so one colour rather than the bar palette — compared rounds
   * included, which the legend and the per-round statistics tell apart.
   */
  private readonly barColor = computed(() =>
    this.themeService.getColor('bar-blue')
  );

  readonly visualizationData = computed(() => {
    const groupsPerRound = this.groupsPerRound();
    const lang = this.translateService.getActiveLang();
    const barColor = this.barColor();
    return {
      labels: (groupsPerRound[0] ?? []).map((group) =>
        formatGroupLabel(group.groupStart, lang)
      ),
      datasets: groupsPerRound.map((groups, i) => ({
        values: groups.map((group) => group.count),
        // Indexed per bar, so a single entry would colour only the first bar.
        colors: groups.map(() => barColor),
        label: this.comparingRounds()
          ? this.roundLabel(this.roundIds()[i])
          : undefined,
      })),
    };
  });

  readonly tooltipTitles = computed(() =>
    groupTooltipTitles(this.groupsPerRound()[0] ?? [])
  );

  readonly hasAnswers = computed(
    () => !!this.roundStatsList()?.[0]?.counts?.length
  );

  readonly correctNumber = computed(() => this.formatData().correctNumber);
  readonly tolerance = computed(() => this.formatData().tolerance);

  /** Above one makes `StatisticInfoComponent` render a second row. */
  readonly statRound = computed(() => (this.comparingRounds() ? 2 : 0));

  readonly statInfos: NumericStat[] = [
    'mean',
    'median',
    'standardDeviation',
    'variance',
    'minimum',
    'maximum',
  ];

  statData(stat: NumericStat): number[] {
    return (this.roundStatsList() ?? []).map(
      (roundStats) => roundStats?.[stat] ?? 0
    );
  }

  private roundLabel(roundId: string): string {
    const roundNo = this.rounds().find(
      (round) => round.id === roundId
    )?.roundNo;
    return (
      this.translateService.translate('content.round') +
      (roundNo != null ? ' ' + roundNo : '')
    );
  }
}
