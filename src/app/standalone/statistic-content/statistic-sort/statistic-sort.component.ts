import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  EventEmitter,
  inject,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import {
  BarController,
  BarControllerDatasetOptions,
  BarElement,
  CategoryScale,
  Chart,
  ChartDataset,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  Combination,
  RoundStatistics,
} from '@app/core/models/round-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';

export const MAX_COMBINATIONS = 4;

@Component({
  selector: 'app-statistic-sort',
  templateUrl: './statistic-sort.component.html',
  styleUrls: ['./statistic-sort.component.scss'],
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    NgClass,
    RenderedTextComponent,
    CorrectAnswerResultsComponent,
  ],
})
export class StatisticSortComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  private themeService = inject(ThemeService);
  private presentationService = inject(PresentationService);
  private contentAnswerService = inject(ContentAnswerService);

  @Input({ required: true }) content!: ContentChoice;
  @Input({ required: true }) visualizationUnitChanged!: EventEmitter<boolean>;
  @Input() directShow = false;
  @Input() showCorrect = false;

  chart?: Chart;
  chartId = '';
  isLoading = true;
  answerIndexes: Array<Array<number>> = [];
  data: ChartDataset<'bar'>[] = [];
  labels: string[] = [];
  colors: string[] = [];
  indicationColors: string[] = [];
  answerOptions: AnswerOption[] = [];
  onSurface: string;
  surface: string;
  green: string;
  grey: string;
  stats?: RoundStatistics;

  constructor() {
    super();
    this.onSurface = this.themeService.getColor('on-surface');
    this.surface = this.themeService.getColor('surface');
    this.green = this.themeService.getColor('green');
    this.grey = this.themeService.getColor('grey');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(stats: AnswerStatistics) {
    this.chartId = 'chart-' + this.content.id;
    this.determineAnswerOptions();
    this.updateData(stats);
  }

  private determineAnswerOptions(): void {
    this.answerOptions = this.showCorrect
      ? this.content.options
      : this.contentAnswerService.shuffleAnswerOptions([
          ...this.content.options,
        ]);
  }

  afterInit() {
    this.contentService
      .getAnswersChangedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const stats = JSON.parse(msg.body).payload.stats;
        if (stats) {
          this.updateData(stats);
          this.updateChart();
        }
      });
    this.visualizationUnitChanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe((isUnitPercent) => {
        this.settings.contentVisualizationUnitPercent = isUnitPercent;
        if (this.chart) {
          this.chart.update();
        }
      });
  }

  updateData(stats: AnswerStatistics) {
    this.stats = stats.roundStatistics[0];
    this.data = [];
    this.answerIndexes = [];
    const combinedCounts = this.getTopCombinations(
      this.stats.combinatedCounts ?? []
    );
    this.data.push({
      data: combinedCounts.map((c) => c.count),
      backgroundColor: this.showCorrect ? this.indicationColors : this.colors,
    });
    this.answerIndexes = combinedCounts.map((c) => c.selectedChoiceIndexes);
    if (this.stats.combinatedCounts) {
      this.initLabels();
    }
    this.updateCounter({
      answers: this.stats.answerCount,
      abstentions: this.stats.abstentionCount,
    });

    this.setColors();
  }

  initLabels() {
    this.labels = [];
    for (let i = 0; i < this.answerIndexes.length; i++) {
      if (
        i < this.answerIndexes.length - 1 ||
        this.answerIndexes.length < MAX_COMBINATIONS
      ) {
        this.labels.push(
          this.answerIndexes[i]
            .map((a) => (this.showCorrect ? a : this.getShuffledIndex(a)) + 1)
            .toString()
            .replace(/,/g, '-')
        );
      } else {
        this.labels.push(
          this.translateService.translate('statistic.other-combinations')
        );
      }
    }
  }

  getShuffledIndex(index: number) {
    return this.answerOptions
      .map((a) => a.label)
      .indexOf(this.content.options[index].label);
  }

  /**
   * Returns most answered combinations and always includes correct combination if there are correct answers.
   */
  getTopCombinations(combinations: Combination[]): Combination[] {
    const sortedList = combinations.sort((a, b) => {
      return a.count < b.count ? 1 : -1;
    });
    let shortenedList = sortedList.slice(0, MAX_COMBINATIONS);
    // If correct combination were selected, move it to the shorted list so that it is displayed in chart
    if (
      this.areCorrectOptionsIncluded(sortedList) &&
      !this.areCorrectOptionsIncluded(shortenedList)
    ) {
      const correctIndex = sortedList.findIndex(
        (c) =>
          JSON.stringify(c.selectedChoiceIndexes) ===
          JSON.stringify(this.content.correctOptionIndexes)
      );
      const correctCombination = sortedList[correctIndex];
      // Insert correct combination before "other"
      sortedList.splice(MAX_COMBINATIONS - 1, 0, correctCombination);
      // Remove correct combination at it's original position
      sortedList.splice(correctIndex + 1, 1);
      shortenedList = sortedList.slice(0, MAX_COMBINATIONS);
    }
    const length = sortedList.length;
    if (length > 5) {
      const otherCount = sortedList
        .slice(MAX_COMBINATIONS, length)
        .map((c) => c.count)
        .reduce((a, b) => a + b, 0);
      shortenedList.push({
        selectedChoiceIndexes: [],
        count: otherCount,
      });
    }
    return shortenedList;
  }

  areCorrectOptionsIncluded(combinations: Combination[]): boolean {
    return JSON.stringify(
      combinations.map((a) => a.selectedChoiceIndexes)
    ).includes(JSON.stringify(this.content.correctOptionIndexes));
  }

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    if (this.answersVisible) {
      this.updateChart();
    } else if (this.showCorrect) {
      this.toggleCorrect();
    }
    return this.answersVisible;
  }

  deleteAnswers() {
    this.data[0].data = [];
    this.labels = [];
    this.updateCounter({
      answers: 0,
      abstentions: 0,
    });
    this.updateChart();
  }

  toggleCorrect() {
    this.showCorrect = !this.showCorrect;
    this.determineAnswerOptions();
    this.initLabels();
    const dataset = this.chart?.config.data
      .datasets[0] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.showCorrect
      ? this.indicationColors
      : this.colors;
    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.update();
    }
  }

  isCombinationCorrect(combination: Combination): boolean {
    const correct = this.content.options
      .map((value, index) => index)
      .toString();
    return combination.selectedChoiceIndexes.toString() === correct;
  }

  isCombinationIndexCorrect(index: number): boolean {
    if (!this.stats) {
      return false;
    }
    return this.isCombinationCorrect(this.stats.combinatedCounts[index]);
  }

  setColors() {
    const barColors = this.themeService.getBarColors();
    const length = this.answerIndexes.length;
    for (let i = 0; i < length; i++) {
      this.colors[i] = barColors[i % barColors.length];
      this.indicationColors[i] = this.isCombinationIndexCorrect(i)
        ? this.colors[i]
        : this.grey;
    }
  }

  initChart() {
    this.setColors();
  }

  createChart() {
    Chart.defaults.color = this.onSurface;
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      ChartDataLabels
    );
    const gridConfig = {
      tickColor: this.isPresentation ? this.surface : this.onSurface,
      drawOnChartArea: !this.isPresentation,
    };
    const scale = this.presentationService.getScale();
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.data,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: 25,
          },
        },
        scales: {
          y: {
            type: 'linear',
            ticks: {
              display: !this.isPresentation,
              precision: 0,
              color: this.isPresentation ? this.surface : this.onSurface,
            },
            grid: {
              tickColor: this.isPresentation ? this.surface : this.onSurface,
              drawOnChartArea: !this.isPresentation,
            },
            border: {
              width: this.isPresentation ? 0 : 1,
              color: this.onSurface,
            },
          },
          x: {
            type: 'category',
            grid: gridConfig,
            border: {
              color: this.onSurface,
              z: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            formatter: (value, context) => {
              return this.getDataLabel(
                context.dataset.data[context.dataIndex] as number,
                context.dataset.data as number[]
              );
            },
            display: (context) => {
              return (context.dataset.data[context.dataIndex] as number) > 0;
            },
            color: this.onSurface,
            anchor: 'end',
            align: 'end',
            offset: 0,
          },
        },
      },
    });
  }

  updateChart() {
    if (this.chart) {
      if (this.chart.data.datasets[0]) {
        this.chart.data.datasets[0].data = this.data[0].data;
      } else {
        this.chart.destroy();
        this.createChart();
        return;
      }
      if (this.chart?.data?.labels?.toString() !== this.labels.toString()) {
        this.chart.data.labels = this.labels;
      }
      this.chart.update();
    } else if (this.active) {
      this.initChart();
      /* Wait for flip animation */
      setTimeout(() => {
        this.createChart();
      }, 300);
    }
  }

  getAnswerCounts(): number[] | undefined {
    if (this.stats) {
      return [this.stats.answerCount];
    }
  }

  getAbstentionCounts(): number[] | undefined {
    if (this.stats) {
      return [this.stats.abstentionCount];
    }
  }

  getCorrectAnswerCounts(): number[] | undefined {
    if (this.stats && this.stats.answerCount) {
      return [
        this.stats.combinatedCounts.find((c) => this.isCombinationCorrect(c))
          ?.count ?? 0,
      ];
    }
  }
}
