import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BarController, BarControllerDatasetOptions, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../../services/http/content.service';
import { ContentChoice } from '../../../../models/content-choice';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../../theme/theme.service';
import { Theme } from '../../../../../theme/Theme';
import { AnswerStatistics } from '../../../../models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { StatisticContentBaseComponent } from '../statistic-content-base';
import { Subject } from 'rxjs';
import { ContentType } from '../../../../models/content-type.enum';
import { ColorElem } from '@arsnova/theme/Theme';
import { ContentScale } from '@arsnova/app/models/content-scale';
import { EventService } from '../../../../services/util/event.service';
import { PresentationService } from '../../../../services/util/presentation.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';

export enum VisualizationUnit {
  ABSOLUTE = 'ABSOLUTE',
  PERCENTAGE = 'PERCENTAGE'
}

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

  destroyed$ = new Subject<void>();
  answerList: AnswerList[] = [];
  chart: Chart;
  chartId: string;
  colors: Array<string[]> = [[], []];
  indicationColors: Array<string[]> = [[], []];
  label = 'ABCDEFGH';
  labels: string[] = [];
  data: Array<number[]> = [[], []];
  colorLabel = false;
  survey = false;
  optionLabels: string[];
  correctOptionIndexes: number[];
  colorStrings = {
    onBackground: '',
    background: '',
    correct: '',
    abstention: ''
  };
  rounds: number;
  roundsToDisplay = 0;
  roundsDisplayed: number;
  independentAnswerCount = [[], [], []];
  visualizationUnit = VisualizationUnit.ABSOLUTE;
  showAnswersBelow = false;

  constructor(protected route: ActivatedRoute,
              protected contentService: ContentService,
              protected translateService: TranslateService,
              protected themeService: ThemeService,
              protected eventService: EventService,
              protected presentationService: PresentationService,
              protected globalStorageService: GlobalStorageService) {
    super(route, contentService, eventService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  init() {
    this.rounds = this.content.state.round;
    this.roundsToDisplay = this.rounds - 1;
    this.chartId = 'chart-' + this.content.id;
    this.optionLabels = this.optionLabels ?? this.content.options.map(o => o.label);
    this.correctOptionIndexes = this.content.correctOptionIndexes;
    if (this.isPresentation) {
      this.showAnswersBelow = this.globalStorageService.getItem(STORAGE_KEYS.SHOW_ANSWERS_BELOW);
      this.visualizationUnit = this.globalStorageService.getItem(STORAGE_KEYS.ANSWER_VISUALIZATION_UNIT);
    }
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

  deleteAnswers() {
    this.data = [[], []];
    this.updateChart();
  }

  createChart(colors: Array<string[]>) {
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.defaults.font.size = this.isPresentation ? 14 : 16;
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartDataLabels);
    const gridConfig = {
      borderColor: this.colorStrings.onBackground,
      tickColor: this.isPresentation ? this.colorStrings.background : this.colorStrings.onBackground,
      drawOnChartArea: !this.isPresentation,
      z: 1
    };
    const barThickness = this.isPresentation ? 80 : 100;
    const dataSets = [
      {
        data: this.data[this.roundsToDisplay],
        backgroundColor: colors[this.roundsToDisplay],
        barThickness: barThickness
      }
    ];
    if (this.roundsToDisplay > 1) {
      dataSets.push(
        {
          data: this.data[1],
          backgroundColor: colors[1],
          barThickness: barThickness
        }
      )
    }
    const scale = this.presentationService.getScale();
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: dataSets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: 25,
            left: this.isPresentation ? -10 : 0
          }
        },
        scales: {
          y: {
            type: 'linear',
            ticks: {
              display: !this.isPresentation,
              precision: 0,
              color: this.isPresentation ? this.colorStrings.background : this.colorStrings.onBackground
            },
            grid: {
              borderWidth: this.isPresentation ? 0 : 1,
              borderColor: this.colorStrings.onBackground,
              tickColor: this.isPresentation ? this.colorStrings.background : this.colorStrings.onBackground,
              drawOnChartArea: !this.isPresentation
            }
          },
          x: {
            type: 'category',
            ticks: {
              display: !this.showAnswersBelow
            },
            grid: gridConfig,
            display: true
          }
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            formatter: (value, context) => {
              return this.getDataLabel(context.dataset.data[context.dataIndex]);
            },
            display: context => {
              return context.dataset.data[context.dataIndex] > 0; 
            },
            color: this.colorStrings.onBackground,
            anchor: 'end',
            align: 'end',
            offset: 0
          }
        }
      }
    });
  }

  getDataLabel(value): string {
    let label: string;
    if (this.visualizationUnit === VisualizationUnit.ABSOLUTE) {
      label = value;
    } else {
      label = (value / this.answerCount * 100).toFixed(0) + '%';
    }
    return label;
  }

  toggleCorrect() {
    if (this.roundsDisplayed > 1) {
      for (let i = 0; i < this.roundsDisplayed; i++) {
        this.toggleChartColor(i, i);
      }
    } else {
      this.toggleChartColor(0, this.roundsDisplayed);
    }
    this.chart.update();
    this.colorLabel = !this.colorLabel;
  }

  toggleChartColor(dataSetIndex: number, roundIndex: number) {
    const dataset = this.chart.config.data.datasets[dataSetIndex] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.colorLabel ? this.colors[roundIndex] : this.indicationColors[roundIndex];
  }

  checkIfCorrect(index: number): boolean {
    return this.correctOptionIndexes?.indexOf(index) > -1;
  }

  getBarColors(): ColorElem[] {
    let colors;
    switch(this.content.format) {
      case ContentType.SCALE:
        colors = this.themeService.getLikertColors();
        if ((this.content as ContentScale).optionCount === 4) {
          colors.splice(2, 1);
        }
        break;
      case ContentType.BINARY:
        colors = this.themeService.getBinaryColors();
        break;
      default:
        colors = this.themeService.getBarColors();
    }
    return colors;
  }

  getColors(theme: Theme) {
    this.colorStrings.onBackground = theme.get('on-surface').color;
    this.colorStrings.background = theme.get('surface').color;
    this.colorStrings.correct = theme.get('green').color;
    this.colorStrings.abstention = theme.get('grey').color;
  }

  initRoundAnswerOptions(answerIndex: number, length: number) {
    const barColors = this.getBarColors();
    for (let j = 0; j < this.rounds; j++) {
      this.colors[j][answerIndex] = barColors[answerIndex % barColors.length].color;
      if (!this.survey) {
        if (this.checkIfCorrect(answerIndex)) {
          this.indicationColors[j][answerIndex] = this.content.correctOptionIndexes?.length === 1 ? this.colors[j][answerIndex] : this.colorStrings.correct;
        } else {
          this.indicationColors[j][answerIndex] = this.colorStrings.abstention;
        }
      }
      if (answerIndex === length - 1 && this.content.abstentionsAllowed) {
        this.colors[j].push(this.colorStrings.abstention);
        this.indicationColors[j].push(this.colorStrings.abstention);
        if (j === this.rounds -1) {
          const label = this.translateService.instant('statistic.abstentions');
          this.labels.push(label);
        }
      }
    }
  }

  initChart() {
    const length = this.optionLabels.length;
    const theme = this.themeService.getCurrentThemeName();
    const currentTheme = this.themeService.getThemeByKey(theme);
    this.getColors(currentTheme);
    for (let i = 0; i < length; i++) {
      this.answerList[i] = new AnswerList(null, null);
      this.labels[i] = this.label.charAt(i);
      this.answerList[i].label = this.labels[i];
      this.answerList[i].answer = this.optionLabels[i];
      this.initRoundAnswerOptions(i, length);
    }
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      if (this.rounds > 1) {
        for (let i = 0; i < this.rounds; i++) {
          if (stats.roundStatistics[i]) {
            this.setData(stats, i);
          }
        }
      } else {
        this.setData(stats, this.roundsToDisplay);
      }
    } else {
      this.independentAnswerCount = [[], [], []];
    }
    this.updateCounterForRound();
  }

  setData(stats, roundIndex) {
    let abstentionCount = 0;
    this.data[roundIndex] = stats.roundStatistics[roundIndex].independentCounts;
    if (this.content.abstentionsAllowed) {
      abstentionCount = stats.roundStatistics[roundIndex].abstentionCount;
      this.data[roundIndex].push(abstentionCount);
    }
    this.updateIndependentAnswerCounts(stats, roundIndex, abstentionCount);
  }

  updateIndependentAnswerCounts(stats: AnswerStatistics, round: number, abstentions: number) {
    this.independentAnswerCount[round] = stats.roundStatistics[round].combinatedCounts?.map(a => a.count) || [];
    this.independentAnswerCount[2] = this.independentAnswerCount[this.getMaxCountIndex()];
    this.independentAnswerCount[round].push(abstentions);
  }

  getMaxCountIndex() {
    return this.getSum(this.independentAnswerCount[0]) > this.getSum(this.independentAnswerCount[1]) ? 0 : 1;
  }

  updateCounterForRound() {
    this.updateCounter(this.independentAnswerCount[this.roundsToDisplay]);
  }

  prepareChartForRoundCompare(resetChart: boolean) {
    for (let i = 0; i < this.rounds; i++) {
      if (resetChart) {
        this.chart.data.datasets.push({
          data: this.data[i],
          backgroundColor: this.colorLabel ? this.indicationColors[i] : this.colors[i]
        });
      } else {
        this.chart.data.datasets[i].data = this.data[i];
      }
    }
  }

  prepareChartForSingleRound(resetChart: boolean) {
    if (resetChart) {
      this.chart.data.datasets.push({
        data: this.data[this.roundsToDisplay],
        backgroundColor: this.colorLabel ? this.indicationColors[this.roundsToDisplay] : this.colors[this.roundsToDisplay]
      });
    } else {
      this.chart.data.datasets[0].data = this.data[this.roundsToDisplay];
      this.chart.data.datasets[0].backgroundColor = this.colors[this.roundsToDisplay];
    }
  }

  updateChart() {
    if (this.chart) {
      let reset = false;
      if (this.roundsDisplayed !== this.roundsToDisplay) {
        this.chart.data.datasets = [];
        reset = true;
      }
      if (this.roundsToDisplay > 0) {
        this.colors[1] = this.colors[0];
        this.indicationColors[1] = this.indicationColors[0];
      }
      if (this.roundsToDisplay < 2) {
        this.prepareChartForSingleRound(reset);
      } else {
        this.prepareChartForRoundCompare(reset);
      }
      this.chart.update();
    } else {
      /* Wait for flip animation */
      setTimeout(() => {
        this.createChart(this.colors);
      }, 300);
    }
    this.roundsDisplayed = this.roundsToDisplay;
  }

  toggleVisualizationUnit() {
    this.visualizationUnit = this.visualizationUnit === VisualizationUnit.ABSOLUTE ? VisualizationUnit.PERCENTAGE : VisualizationUnit.ABSOLUTE;
    this.globalStorageService.setItem(STORAGE_KEYS.ANSWER_VISUALIZATION_UNIT, this.visualizationUnit);
    if (this.chart) {
      this.chart.update();
    }
  }

  toggleAnswerListLayout() {
    this.showAnswersBelow = !this.showAnswersBelow;
    this.globalStorageService.setItem(STORAGE_KEYS.SHOW_ANSWERS_BELOW, this.showAnswersBelow);
    if (this.chart) {
      this.chart.destroy();
      this.createChart(this.colors);
    }
  }
}
