import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentService } from '@app/core/services/http/content.service';
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
import { StatisticContentBaseComponent } from '@app/shared/statistic-content/statistic-content-base';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '@app/core/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Combination } from '@app/core/models/round-statistics';
import { EventService } from '@app/core/services/util/event.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';

export const MAX_COMBINATIONS = 4;

@Component({
  selector: 'app-statistic-sort',
  templateUrl: './statistic-sort.component.html',
  styleUrls: ['./statistic-sort.component.scss'],
})
export class StatisticSortComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input() content: ContentChoice;
  @Input() directShow: boolean;

  chart: Chart;
  chartId: string;
  isLoading = true;
  answerIndexes: Array<Array<number>> = [];
  data: ChartDataset<'bar'>[] = [];
  labels: string[] = [];
  colors: string[] = [];
  indicationColors: string[] = [];
  answerOptions: AnswerOption[];
  showCorrect = false;
  onSurface: string;
  surface: string;
  green: string;
  grey: string;

  constructor(
    protected contentService: ContentService,
    private themeService: ThemeService,
    private translateService: TranslateService,
    protected eventService: EventService,
    private presentationService: PresentationService,
    private contentAnswerService: ContentAnswerService
  ) {
    super(contentService, eventService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(stats: AnswerStatistics) {
    this.chartId = 'chart-' + this.content.id;
    this.shuffleAnswerOptions();
    this.updateData(stats);
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
    this.visualizationUnitChanged.subscribe((isUnitPercent) => {
      this.settings.contentVisualizationUnitPercent = isUnitPercent;
      this.chart.update();
    });
  }

  updateData(stats: AnswerStatistics) {
    const roundStatistics = stats.roundStatistics[0];
    this.data = [];
    this.answerIndexes = [];
    const combinedCounts = this.getTopCombinations(
      roundStatistics.combinatedCounts ?? []
    );
    this.data.push({
      data: combinedCounts.map((c) => c.count),
      backgroundColor: this.showCorrect ? this.indicationColors : this.colors,
    });
    let abstentionCount = 0;
    if (this.content.abstentionsAllowed) {
      abstentionCount = roundStatistics.abstentionCount;
      this.data[0].data.push(abstentionCount);
    }
    this.answerIndexes = combinedCounts.map((c) => c.selectedChoiceIndexes);
    if (roundStatistics.combinatedCounts || roundStatistics.abstentionCount) {
      this.initLabels();
    }
    const listToCount = combinedCounts.map((c) => c.count);
    listToCount.push(abstentionCount);
    this.updateCounter(listToCount);
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
          this.translateService.instant('statistic.other-combinations')
        );
      }
    }
    if (this.content.abstentionsAllowed) {
      this.labels.push(this.translateService.instant('statistic.abstentions'));
    }
  }

  getShuffledIndex(index: number) {
    return this.answerOptions
      .map((a) => a.label)
      .indexOf(this.content.options[index].label);
  }

  shuffleAnswerOptions() {
    this.answerOptions = this.contentAnswerService.shuffleAnswerOptions(
      JSON.parse(JSON.stringify(this.content.options))
    );
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
    this.updateChart();
  }

  toggleCorrect() {
    this.showCorrect = !this.showCorrect;
    if (this.showCorrect) {
      this.answerOptions = this.content.options;
    } else {
      this.shuffleAnswerOptions();
    }
    this.initLabels();
    const dataset = this.chart.config.data
      .datasets[0] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.showCorrect
      ? this.indicationColors
      : this.colors;
    this.chart.data.labels = this.labels;
    this.chart.update();
  }

  checkIfCorrect(index: number): boolean {
    const correct = this.content.options
      .map((o) => this.content.options.map((a) => a.label).indexOf(o.label))
      .toString();
    const toCheck = this.answerIndexes[index].toString();
    return toCheck === correct;
  }

  setColors() {
    const barColors = this.themeService.getBarColors();
    const length = this.answerIndexes.length;
    for (let i = 0; i < length; i++) {
      this.colors[i] = barColors[i % barColors.length];
      this.indicationColors[i] = this.checkIfCorrect(i)
        ? this.colors[i]
        : this.grey;
    }
    if (this.content.abstentionsAllowed) {
      this.colors.splice(length, 1, this.grey);
      this.indicationColors.splice(length, 1, this.grey);
    }
  }

  initChart() {
    this.onSurface = this.themeService.getColor('on-surface');
    this.surface = this.themeService.getColor('surface');
    this.green = this.themeService.getColor('green');
    this.grey = this.themeService.getColor('grey');
    this.setColors();
  }

  createChart() {
    Chart.defaults.color = this.onSurface;
    Chart.defaults.font.size = this.isPresentation ? 14 : 16;
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
    this.data[0].barThickness = this.isPresentation ? 80 : null;
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
              return this.getDataLabel(context.dataset.data[context.dataIndex]);
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
      if (this.chart.data.labels.toString() !== this.labels.toString()) {
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
}
