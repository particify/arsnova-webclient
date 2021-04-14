import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BarController,
  BarControllerDatasetOptions,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip
} from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../../services/http/content.service';
import { ContentChoice } from '../../../../models/content-choice';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../../theme/theme.service';
import { AnswerStatistics } from '../../../../models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { Subject } from 'rxjs';

export class AnswerList {
  label: string;
  answer: string;

  constructor(label: string, answer: string) {
    this.label = label;
    this.answer = answer;
  }
}

@Component({
  selector: 'app-statistic-choice',
  templateUrl: './statistic-choice.component.html',
  styleUrls: ['./statistic-choice.component.scss']
})
export class StatisticChoiceComponent extends StatisticContentBaseComponent implements OnInit, OnDestroy {

  @Input() content: ContentChoice;
  @Input() directShow: boolean;
  @Input() isSurvey: boolean;

  destroyed$ = new Subject();
  answerList: AnswerList[] = [];
  chart: Chart;
  chartId: string;
  colors: string[] = [];
  indicationColors: string[] = [];
  label = 'ABCDEFGH';
  labels: string[] = [];
  data: number[] = [];
  colorLabel = false;
  survey = false;
  onSurface: string;
  surface: string;
  green: string;
  grey: string;
  blue: string;

  constructor(protected route: ActivatedRoute,
              protected contentService: ContentService,
              private translateService: TranslateService,
              private themeService: ThemeService) {
    super(route, contentService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  init() {
    this.chartId = 'chart-' + this.content.id;
    this.initChart();
  }

  initData(stats: AnswerStatistics) {
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

  toggleAnswers(visible?: boolean): boolean {
    this.colorLabel = false;
    this.answersVisible = visible ?? !this.answersVisible;
    if (this.answersVisible) {
      this.updateChart();
    }
    return this.answersVisible;
  }


  createChart(colors: string[]) {
    Chart.defaults.color = this.onSurface;
    Chart.defaults.font.size = 16;
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            ticks: {
              precision: 0,
            },
            grid: {
              borderColor: this.onSurface
            }
          },
          x: {
            type: 'category',
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

  toggleCorrect() {
    const dataset = this.chart.config.data.datasets[0] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.colorLabel ? this.colors : this.indicationColors;
    this.chart.update();
    this.colorLabel = !this.colorLabel;
  }

  checkIfCorrect(index: number): boolean {
    return (this.content as ContentChoice).correctOptionIndexes?.indexOf(index) > -1;
  }

  initChart() {
    const length = this.content.options.length;
    this.themeService.getTheme().pipe(takeUntil(this.destroyed$)).subscribe(theme => {
      const currentTheme = this.themeService.getThemeByKey(theme);
      this.onSurface = currentTheme.get('on-surface').color;
      this.surface = currentTheme.get('surface').color;
      this.green = currentTheme.get('green').color;
      this.grey = currentTheme.get('grey').color;
      this.blue = currentTheme.get('blue').color;

      for (let i = 0; i < length; i++) {
        this.answerList[i] = new AnswerList(null, null);
        this.labels[i] = this.label.charAt(i);
        this.answerList[i].label = this.labels[i];
        this.answerList[i].answer = this.content.options[i].label;
        this.colors[i] = this.blue;
        if (!this.survey) {
          if (this.checkIfCorrect(i)) {
            this.indicationColors[i] = this.green;
          } else {
            this.indicationColors[i] = this.blue;
          }
        }
      }
      if (this.content.abstentionsAllowed) {
        this.translateService.get('statistic.abstentions').subscribe(label => {
          this.labels.push(label);
          this.colors.push(this.grey);
          this.indicationColors.push(this.grey);
        });
      }
    });
  }

  updateData(stats: AnswerStatistics) {
    this.data = stats.roundStatistics[0].independentCounts;
    let abstentionCount = 0;
    if (this.content.abstentionsAllowed) {
      abstentionCount = stats.roundStatistics[0].abstentionCount;
      this.data.push(abstentionCount);
    }
    const listToCount = stats.roundStatistics[0].combinatedCounts?.map(a => a.count) || [];
    listToCount.push(abstentionCount);
    this.updateCounter(listToCount);
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.datasets[0].data = this.data;
      this.chart.update();
    } else {
      /* Wait for flip animation */
      setTimeout(() => {
        this.createChart(this.colors);
      }, 300);
    }
  }
}
