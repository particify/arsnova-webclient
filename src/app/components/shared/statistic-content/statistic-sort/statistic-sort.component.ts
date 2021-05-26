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
  Tooltip
} from 'chart.js';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ThemeService } from '@arsnova/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Combination } from '@arsnova/app/models/round-statistics';

export const MAX_COMBINATIONS = 4;

@Component({
  selector: 'app-statistic-sort',
  templateUrl: './statistic-sort.component.html',
  styleUrls: ['./statistic-sort.component.scss']
})
export class StatisticSortComponent extends StatisticContentBaseComponent implements OnInit, OnDestroy {

  @Input() content: ContentChoice;
  @Input() directShow: boolean;

  destroyed$ = new Subject();
  chart: Chart;
  chartId: string;
  isLoading = true;
  answerIndexes: Array<Array<number>> = [];
  data: ChartDataset<'bar'>[] = [];
  labels: string[] = [];
  answers: string[] = [];
  colors: string[] = [];
  indicationColors: string[] = [];
  showCorrect = false;
  onSurface: string;
  surface: string;
  green: string;
  grey: string;

  constructor(protected contentService: ContentService,
              protected route: ActivatedRoute,
              private themeService: ThemeService,
              private translateService: TranslateService) {
    super(route, contentService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init(): void {
    this.chartId = 'chart-' + this.content.id;
  }

  initData(stats: AnswerStatistics) {
    this.answers = this.content.options.map(o => o.label);
    this.updateData(stats);
  }

  afterInit() {
    this.contentService.getAnswersChangedStream(this.content.roomId, this.content.id).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(msg => {
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
      const combinedCounts = this.checkIfTooMany(roundStatistics.combinatedCounts ?? []);
      this.data.push(
        {
          data: combinedCounts.map(c => c.count),
          backgroundColor: this.showCorrect ? this.indicationColors : this.colors
        }
      );
      let abstentionCount = 0;
      if (this.content.abstentionsAllowed) {
        abstentionCount = roundStatistics.abstentionCount;
        this.data[0].data.push(abstentionCount);
      }
      this.answerIndexes = combinedCounts.map(c => c.selectedChoiceIndexes);
      for (let i = 0; i < this.answerIndexes.length; i++) {
        if (i < this.answerIndexes.length - 1 || this.answerIndexes.length < MAX_COMBINATIONS) {
          this.labels.push(this.answerIndexes[i].map(a => a + 1).toString().replace(/,/g, '-'));
        } else {
          this.labels.push(this.translateService.instant('statistic.other-combinations'));
        }
      }
      if (this.content.abstentionsAllowed) {
        this.translateService.get('statistic.abstentions').subscribe(label => {
          this.labels.push(label);
        });
      }
      const listToCount = combinedCounts.map(c => c.count);
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
      const otherCount = sortedList.slice(MAX_COMBINATIONS, length).map(c => c.count).reduce((a, b) => a + b, 0);
      shortenedList.push(
        {
          selectedChoiceIndexes: [],
          count: otherCount
        }
      );
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

  toggleCorrect() {
    const dataset = this.chart.config.data.datasets[0] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.showCorrect ? this.colors : this.indicationColors;
    this.chart.update();
    this.showCorrect = !this.showCorrect;
  }

  checkIfCorrect(index: number): boolean {
    const correct = this.content.options.map(o => this.content.options.map(a => a.label).indexOf(o.label)).toString();
    const toCheck = this.answerIndexes[index].toString();
    return toCheck === correct;
  }

  setColors() {
    const barColors = this.themeService.getBarColors();
    const length = this.answerIndexes.length;
    for (let i = 0; i < length; i++) {
      this.colors[i] = barColors[i % barColors.length].color;
      this.indicationColors[i] = this.checkIfCorrect(i) ? this.colors[i] : this.grey;

    }
    if (this.content.abstentionsAllowed) {
      this.colors.splice(length, 1, this.grey);
      this.indicationColors.splice(length, 1, this.grey);
    }
  }

  initChart() {
    this.themeService.getTheme().pipe(takeUntil(this.destroyed$)).subscribe(theme => {
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
    Chart.defaults.font.size = 16;
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.data
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              precision: 0,
            },
            grid: {
              borderColor: this.onSurface
            }
          },
          x: {
            grid: {
              borderColor: this.onSurface
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index'
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      if (this.chart.data.labels.toString() !== this.labels.toString()) {
        this.chart.data.labels = this.labels;
      }
      this.chart.data.datasets[0].data = this.data[0].data;
      this.chart.update();
    } else {
      this.initChart();
      /* Wait for flip animation */
      setTimeout(() => {
        this.createChart();
      }, 300);
    }
  }
}
