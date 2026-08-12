import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, of, share, switchMap, takeUntil } from 'rxjs';
import { onlyCompleteData } from 'apollo-angular';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ChoiceAnswerListComponent } from '@app/standalone/content-results/choice-results/choice-answer-list/choice-answer-list.component';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
  AnswerOption,
  QuestionnaireSortRoundStatsByRoundIdGql,
  QuestionnaireSortRoundStatsUpdatedGql,
  SortContentFormatData,
} from '@gql/generated/graphql';
import {
  Combination,
  isAggregate,
  sameOrder,
  selectTopCombinations,
} from './combination-selection';

@Component({
  selector: 'app-sort-results',
  templateUrl: './sort-results.component.html',
  imports: [
    BarChartComponent,
    ChoiceAnswerListComponent,
    CoreModule,
    CorrectAnswerResultsComponent,
  ],
})
export class SortResultsComponent {
  private readonly answerService = inject(ContentAnswerService);
  private readonly presentationService = inject(PresentationService);
  private readonly themeService = inject(ThemeService);
  private readonly translateService = inject(TranslocoService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireSortRoundStatsByRoundIdGql
  );
  private readonly roundStatsUpdated = inject(
    QuestionnaireSortRoundStatsUpdatedGql
  );

  readonly roundIds = input.required<string[]>();
  readonly formatData = input.required<SortContentFormatData>();
  readonly hasCorrectAnswer = input(false);
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly answerCount = input(0);
  readonly correctAnswerCount = input(0);
  readonly abstentionCount = input(0);

  private readonly roundId = computed(() => this.roundIds()[0]);

  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.getScale() : 1
  );

  readonly roundStats = toSignal(
    toObservable(this.roundId).pipe(
      switchMap((roundId) => {
        // A content without a round yet has no stats to load.
        if (!roundId) {
          return of(undefined);
        }
        const initial$ = this.roundStatsByRoundId
          .watch({ variables: { roundId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map((r) => r.data?.questionnaireSortRoundStatsByRoundId)
          );

        const updates$ = this.roundStatsUpdated
          .subscribe({ variables: { roundId } })
          .pipe(
            map((r) => r.data?.questionnaireSortRoundStatsUpdated),
            share()
          );
        return merge(initial$.pipe(takeUntil(updates$)), updates$);
      })
    )
  );

  private readonly combinations = computed<Combination[]>(
    () => this.roundStats()?.combinations ?? []
  );

  private readonly options = computed(() => this.formatData().options);

  /**
   * The correct order as positions in the stored, shuffled options; withheld
   * from participants until the correct answers are published.
   */
  private readonly correctOrder = computed(
    () => this.formatData().correctOrder ?? undefined
  );

  /**
   * Shuffled once per item set - a live update must not renumber the list - and
   * only until the reveal, so the numbers in the chart give nothing away.
   */
  private readonly shuffledOptions = linkedSignal<string, AnswerOption[]>({
    source: () => JSON.stringify(this.options().map((option) => option.label)),
    computation: () =>
      untracked(() =>
        this.answerService.shuffleAnswerOptions([...this.options()])
      ),
  });

  private readonly displayOptions = computed(() => {
    const correctOrder = this.correctOrder();
    return this.showCorrect() && correctOrder
      ? correctOrder.map((index) => this.options()[index])
      : this.shuffledOptions();
  });

  /** Where each stored option sits in the list rendered below the chart. */
  private readonly displayPositions = computed(() => {
    const labels = this.displayOptions().map((option) => option.label);
    return this.options().map((option) => labels.indexOf(option.label));
  });

  readonly topCombinations = computed(() =>
    selectTopCombinations(this.combinations(), this.correctOrder() ?? [])
  );

  private readonly barColors = computed(() => {
    const palette = this.themeService.getBarColors();
    const grey = this.themeService.getColor('grey');
    const correctOrder = this.correctOrder();
    return this.topCombinations().map((combination, index) =>
      this.showCorrect() &&
      correctOrder &&
      !sameOrder(combination.selectedChoiceIndexes, correctOrder)
        ? grey
        : palette[index % palette.length]
    );
  });

  readonly visualizationData = computed(() => ({
    labels: this.topCombinations().map((combination) =>
      this.combinationLabel(combination)
    ),
    datasets: [
      {
        values: this.topCombinations().map((combination) => combination.count),
        colors: this.barColors(),
      },
    ],
  }));

  readonly answerItems = computed(() =>
    this.displayOptions().map((option, index) => ({
      index,
      labelLetter: String(index + 1),
      label: option.label,
      labelRendered: option.labelRendered ?? undefined,
      count: 0,
      // The whole displayed order is the correct one once it is revealed.
      isCorrect: this.showCorrect() && !!this.correctOrder(),
    }))
  );

  private combinationLabel(combination: Combination): string {
    if (isAggregate(combination)) {
      return this.translateService.translate('statistic.other-combinations');
    }
    const positions = this.displayPositions();
    return combination.selectedChoiceIndexes
      .map((index) => positions[index] + 1)
      .join('-');
  }
}
