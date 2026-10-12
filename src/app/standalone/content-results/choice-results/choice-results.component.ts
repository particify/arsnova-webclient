import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ChoiceContentFormatData,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
  QuestionnaireChoiceRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { onlyCompleteData } from 'apollo-angular';
import { map, switchMap } from 'rxjs';
import { updateOn } from '@gql/helper/update-on';
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
  private readonly themeService = inject(ThemeService);
  private readonly roundStatsByRoundId = inject(
    QuestionnaireChoiceRoundStatsByRoundIdGql
  );
  private readonly presentationService = inject(PresentationService);
  private readonly choiceRoundStatsUpdated = inject(
    QuestionnaireChoiceRoundStatsUpdatedGql
  );
  readonly roundId = input.required<string>();
  readonly hasCorrectAnswer = input(false);
  readonly formatData = input.required<ChoiceContentFormatData>();
  /** The number of respondents, which the shares of a multiple choice relate to. */
  readonly answerCount = input(0);
  readonly showCorrect = input(false);
  readonly resultsVisible = input(true);
  readonly answersDirectlyBelowChart = input(false);
  readonly visualizationUnitPercent = input(false);
  readonly isPresentation = input(false);
  readonly scale = computed(() =>
    this.isPresentation() ? this.presentationService.scale() : 1
  );
  readonly roundStats = toSignal(
    toObservable(this.roundId).pipe(
      switchMap((roundId) =>
        updateOn(
          this.roundStatsByRoundId.watch({ variables: { roundId } }),
          this.choiceRoundStatsUpdated.subscribe({ variables: { roundId } }),
          (r) =>
            r.data && {
              questionnaireChoiceRoundStatsByRoundId:
                r.data.questionnaireChoiceRoundStatsUpdated,
            }
        ).pipe(
          onlyCompleteData(),
          map((r) => r.data?.questionnaireChoiceRoundStatsByRoundId)
        )
      )
    )
  );

  readonly selectionCounts = computed(
    () => this.roundStats()?.selectionCounts ?? []
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
  readonly visualizationData = computed(() => ({
    labels: this.labels(),
    datasets: [
      {
        values: this.selectionCounts(),
        colors: this.colors(),
      },
    ],
  }));
  readonly answerItems = computed(() =>
    this.options().map((option, index) => ({
      index,
      labelLetter: this.labels()[index],
      label: option.label,
      labelRendered: option.labelRendered ?? undefined,
      count: this.selectionCounts()[index] ?? 0,
      isCorrect:
        this.formatData().correctOptionIndexes?.includes(index) ?? false,
    }))
  );

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
