import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ContentChoice } from '../../../../models/content-choice';
import { ContentService } from '../../../../services/http/content.service';
import { AnswerStatistics } from '../../../../models/answer-statistics';
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
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '../../../../../theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Combination } from '../../../../models/round-statistics';
import { EventService } from '../../../../services/util/event.service';
import { PresentationService } from '../../../../services/util/presentation.service';

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
    private presentationService: PresentationService
  ) {
    super(contentService, eventService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(stats: AnswerStatistics) {
    this.chartId = 'chart-' + this.content.id;
    this.updateData(stats);
  }

  afterInit() {
    this.contentService
      .getAnswersChangedStream(this.content.roomId, this.content.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((msg) => {
        const stats = JSON.parse(msg.body).payload.stats;
        this.updateData(stats);
        this.updateChart();
      });
  }

  updateData(stats: AnswerStatistics) {
    const roundStatistics = stats.roundStatistics[0];
    if (roundStatistics.combinatedCounts || roundStatistics.abstentionCount) {
      this.data = [];
      this.labels = [];
      this.answerIndexes = [];
      const combinedCounts = this.checkIfTooMany(
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
      for (let i = 0; i < this.answerIndexes.length; i++) {
        if (
          i < this.answerIndexes.length - 1 ||
          this.answerIndexes.length < MAX_COMBINATIONS
        ) {
          this.labels.push(
            this.answerIndexes[i]
              .map((a) => a + 1)
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
        this.translateService
          .get('statistic.abstentions')
          .subscribe((label) => {
            this.labels.push(label);
          });
      }
      const listToCount = combinedCounts.map((c) => c.count);
      listToCount.push(abstentionCount);
      this.updateCounter(listToCount);
      this.setColors();
    } else {
      this.updateCounter([0]);
    }
  }

  checkIfTooMany(combinations: Combination[]): Combination[] {
    const sortedList = combinations.sort((a, b) => {
      return a.count < b.count ? 1 : -1;
    });
    const shortenedList = sortedList.slice(0, MAX_COMBINATIONS);
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
    this.data = [];
    this.updateChart();
  }

  toggleCorrect() {
    const dataset = this.chart.config.data
      .datasets[0] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.showCorrect
      ? this.colors
      : this.indicationColors;
    this.chart.update();
    this.showCorrect = !this.showCorrect;
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
      this.colors[i] = barColors[i % barColors.length].color;
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
    this.themeService
      .getTheme()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((theme) => {
        const currentTheme = this.themeService.getThemeByKey(theme);
        this.onSurface = currentTheme.get('on-surface').color;
        this.surface = currentTheme.get('surface').color;
        this.green = currentTheme.get('green').color;
        this.grey = currentTheme.get('grey').color;
        this.setColors();
      });
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
      z: 1,
    };
    const scale = this.presentationService.getScale();
    this.data[0].barThickness = this.isPresentation ? 80 : 100;
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
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            display: (context) => {
              return context.dataset.data[context.dataIndex] > 0;
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
