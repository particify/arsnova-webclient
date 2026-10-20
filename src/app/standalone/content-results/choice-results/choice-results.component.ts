import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ChoiceContentFormatData,
  ChoiceContentRoundStats,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
  QuestionnaireChoiceRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { Apollo, onlyCompleteData } from 'apollo-angular';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { updateRoundOn } from '@gql/helper/recover-deleted-round';
import { updatesOnceOpen } from '@app/standalone/content-results/round-updates';
import { TranslocoService } from '@jsverse/transloco';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import { ChoiceAnswerListComponent } from './choice-answer-list/choice-answer-list.component';
import {
  CARD_WIDTH,
  PresentationService,
} from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { VisualizationType } from '@app/standalone/content-results/visualization/visualization-type';
import { CoreModule } from '@app/core/core.module';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';

@Component({
  selector: 'app-choice-results',
  templateUrl: './choice-results.component.html',
  imports: [
    CorrectAnswerResultsComponent,
    ChoiceAnswerListComponent,
    CoreModule,
    BarChartComponent,
  ],
})
export class ChoiceResultsComponent {
  private readonly apollo = inject(Apollo);
  private readonly themeService = inject(ThemeService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireChoiceRoundStatsByRoundIdGql
  );
  private readonly presentationService = inject(PresentationService);
  private readonly choiceRoundStatsUpdated = inject(
    QuestionnaireChoiceRoundStatsUpdatedGql
  );
  private readonly translateService = inject(TranslocoService);
  readonly roundIds = input.required<string[]>();
  readonly rounds = input.required<Round[]>();
  private readonly rounds$ = toObservable(this.rounds);
  readonly hasCorrectAnswer = input(false);
  readonly formatData = input.required<ChoiceContentFormatData>();
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly answersDirectlyBelowChart = input(false);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly answerCount = input(0);
  readonly correctAnswerCount = input(0);
  readonly abstentionCount = input(0);
  readonly activeRoundId = input<string>();
  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.scale() : 1
  );

  private statsForRound(
    roundId: string
  ): Observable<ChoiceContentRoundStats | null | undefined> {
    return updateRoundOn(
      this.apollo.client,
      this.roundStatsByRoundId.watch({
        variables: { roundId },
        fetchPolicy: 'cache-and-network',
      }),
      updatesOnceOpen(this.rounds$, roundId, () =>
        this.choiceRoundStatsUpdated.subscribe({ variables: { roundId } })
      ),
      (r) =>
        r.data && {
          questionnaireChoiceRoundStatsByRoundId:
            r.data.questionnaireChoiceRoundStatsUpdated,
        }
    ).pipe(
      onlyCompleteData(),
      map((r) => r.data?.questionnaireChoiceRoundStatsByRoundId)
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
  /**
   * The answer counts are only known for the active round, so they cannot be
   * shown for another round or for a comparison.
   */
  readonly showsActiveRoundOnly = computed(() => {
    const roundIds = this.roundIds();
    return roundIds.length === 1 && roundIds[0] === this.activeRoundId();
  });
  /**
   * The respondents the shares of a multiple choice relate to. Other or
   * compared rounds show shares of selections.
   */
  readonly respondentCount = computed(() =>
    this.showsActiveRoundOnly() ? this.answerCount() || undefined : undefined
  );
  readonly options = computed(() => this.formatData().options);
  readonly labels = computed(() =>
    this.options().map((_, index) => String.fromCharCode(65 + index))
  );
  readonly answerLabelWidth = computed(() => {
    const optionCount = this.options().length;

    return (CARD_WIDTH - (optionCount - 1) * 12) / optionCount + 'px';
  });
  private readonly barColors = computed(() => {
    const palette = this.themeService.getBarColors();
    return this.options().map((_, index) => palette[index % palette.length]);
  });
  private readonly colors = computed(() => {
    if (!this.showCorrect() || !this.hasCorrectAnswer()) {
      return this.barColors();
    }
    const correctIndexes = this.formatData().correctOptionIndexes ?? [];
    const correctColor =
      correctIndexes.length > 1 ? this.themeService.getColor('green') : null;
    const wrongColor = this.themeService.getColor('grey');
    return this.barColors().map((color, index) =>
      correctIndexes.includes(index) ? (correctColor ?? color) : wrongColor
    );
  });
  readonly visualizationData = computed(() => {
    const stats = this.roundStatsList() ?? [];
    return {
      labels: this.labels(),
      datasets: this.roundIds().map((roundId, i) => ({
        values: stats[i]?.selectionCounts ?? [],
        colors: this.colors(),
        label: this.comparingRounds() ? this.roundLabel(roundId) : undefined,
      })),
    };
  });
  readonly answerItems = computed(() => {
    const selectionCounts = this.roundStatsList()?.[0]?.selectionCounts ?? [];
    return this.options().map((option, index) => ({
      index,
      labelLetter: this.labels()[index],
      label: option.label,
      labelRendered: option.labelRendered ?? undefined,
      count: selectionCounts[index] ?? 0,
      isCorrect:
        this.formatData().correctOptionIndexes?.includes(index) ?? false,
    }));
  });

  private roundLabel(roundId: string): string {
    const roundNo = this.rounds().find(
      (round) => round.id === roundId
    )?.roundNo;
    return (
      this.translateService.translate('content.round') +
      (roundNo != null ? ' ' + roundNo : '')
    );
  }

  visualizationType = signal(VisualizationType.WORDCLOUD);
  VisualizationType = VisualizationType;

  toggleVisualizationType() {
    this.visualizationType.update((v) =>
      v === VisualizationType.BAR
        ? VisualizationType.WORDCLOUD
        : VisualizationType.BAR
    );
  }
}
