import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BarController,
  BarControllerDatasetOptions,
  BarElement,
  CategoryScale,
  Chart,
  ChartDataset,
  GridLineOptions,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { StatisticContentBaseComponent } from '@app/shared/statistic-content/statistic-content-base';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentScale } from '@app/core/models/content-scale';
import { EventService } from '@app/core/services/util/event.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AnswerOption } from '@app/core/models/answer-option';

@Component({
  selector: 'app-statistic-choice',
  templateUrl: './statistic-choice.component.html',
  styleUrls: ['./statistic-choice.component.scss'],
})
export class StatisticChoiceComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input() content: ContentChoice;
  @Input() directShow: boolean;
  @Input() isSurvey: boolean;

  chart: Chart;
  chartId: string;
  colors: Array<string[]> = [[], []];
  indicationColors: Array<string[]> = [[], []];
  labelLetters = 'ABCDEFGH';
  data: Array<number[]> = [[], []];
  colorLabel = false;
  survey = false;
  options: AnswerOption[];
  correctOptionIndexes: number[];
  colorStrings = {
    onBackground: '',
    background: '',
    correct: '',
    abstention: '',
  };
  rounds: number;
  roundsToDisplay = 0;
  roundsDisplayed: number;
  independentAnswerCount = [[], [], []];
  ContentType: typeof ContentType = ContentType;

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslateService,
    protected themeService: ThemeService,
    protected eventService: EventService,
    protected presentationService: PresentationService
  ) {
    super(contentService, eventService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  init(stats: AnswerStatistics) {
    this.rounds = this.content.state.round;
    this.roundsToDisplay = this.rounds - 1;
    this.chartId = 'chart-' + this.content.id;
    if (this.content.options) {
      this.options = [...this.content.options];
    }
    this.correctOptionIndexes = this.content.correctOptionIndexes;
    this.initChart();
    this.updateData(stats);
    this.visualizationUnitChanged.subscribe((isUnitPercent) => {
      this.settings.contentVisualizationUnitPercent = isUnitPercent;
      this.chart.update();
    });
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
    this.visualizationUnitChanged.subscribe((isUnitPercent) => {
      this.settings.contentVisualizationUnitPercent = isUnitPercent;
      this.chart.update();
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

  prepareDataAndCreateChart(colors: Array<string[]>) {
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.defaults.font.size = this.isPresentation ? 14 : 16;
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      ChartDataLabels
    );

    const gridConfig = {
      tickColor: this.isPresentation
        ? this.colorStrings.background
        : this.colorStrings.onBackground,
      drawOnChartArea: !this.isPresentation,
    };
    const barThickness = this.isPresentation ? 80 : null;
    const dataSets = [
      {
        data: this.data[this.roundsToDisplay],
        backgroundColor: colors[this.roundsToDisplay],
        barThickness: barThickness,
      },
    ];
    if (this.roundsToDisplay > 1) {
      dataSets.push({
        data: this.data[1],
        backgroundColor: colors[1],
        barThickness: barThickness,
      });
    }
    const scale = this.presentationService.getScale();
    const labels = Array.from(this.labelLetters).slice(0, this.options.length);
    if (this.content.abstentionsAllowed) {
      const label = this.translateService.instant('statistic.abstentions');
      labels.push(label);
    }
    this.createChart(labels, dataSets, scale, gridConfig as GridLineOptions);
  }

  createChart(
    labels: string[],
    dataSets: ChartDataset[],
    scale: number,
    gridConfig: GridLineOptions
  ) {
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: 25,
            left: this.isPresentation ? -10 : 0,
          },
        },
        scales: {
          y: {
            type: 'linear',
            ticks: {
              display: !this.isPresentation,
              precision: 0,
              color: this.isPresentation
                ? this.colorStrings.background
                : this.colorStrings.onBackground,
            },
            grid: {
              tickColor: this.isPresentation
                ? this.colorStrings.background
                : this.colorStrings.onBackground,
              drawOnChartArea: !this.isPresentation,
            },
            border: {
              width: this.isPresentation ? 0 : 1,
              color: this.colorStrings.onBackground,
            },
          },
          x: {
            type: 'category',
            ticks: {
              display:
                !this.settings.contentAnswersDirectlyBelowChart ||
                !this.isPresentation,
            },
            grid: gridConfig,
            border: {
              color: this.colorStrings.onBackground,
              z: 1,
            },
            display: true,
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
              return context.dataset.data[context.dataIndex] > 0;
            },
            color: this.colorStrings.onBackground,
            anchor: 'end',
            align: 'end',
            offset: 0,
          },
        },
      },
    });
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
    const dataset = this.chart.config.data.datasets[
      dataSetIndex
    ] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.colorLabel
      ? this.colors[roundIndex]
      : this.indicationColors[roundIndex];
  }

  checkIfCorrect(index: number): boolean {
    return this.correctOptionIndexes?.indexOf(index) > -1;
  }

  getBarColors(): string[] {
    let colors;
    switch (this.content.format) {
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

  getColors() {
    this.colorStrings.onBackground = this.themeService.getColor('on-surface');
    this.colorStrings.background = this.themeService.getColor('surface');
    this.colorStrings.correct = this.themeService.getColor('green');
    this.colorStrings.abstention = this.themeService.getColor('grey');
  }

  initRoundAnswerOptions(answerIndex: number, length: number) {
    const barColors = this.getBarColors();
    for (let j = 0; j < this.rounds; j++) {
      this.colors[j][answerIndex] = barColors[answerIndex % barColors.length];
      if (!this.survey) {
        if (this.checkIfCorrect(answerIndex)) {
          this.indicationColors[j][answerIndex] =
            this.content.correctOptionIndexes?.length === 1
              ? this.colors[j][answerIndex]
              : this.colorStrings.correct;
        } else {
          this.indicationColors[j][answerIndex] = this.colorStrings.abstention;
        }
      }
      if (answerIndex === length - 1 && this.content.abstentionsAllowed) {
        this.colors[j].push(this.colorStrings.abstention);
        this.indicationColors[j].push(this.colorStrings.abstention);
      }
    }
  }

  initChart() {
    const length = this.options.length;
    this.getColors();
    for (let i = 0; i < length; i++) {
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

  updateIndependentAnswerCounts(
    stats: AnswerStatistics,
    round: number,
    abstentions: number
  ) {
    this.independentAnswerCount[round] =
      stats.roundStatistics[round].combinatedCounts?.map((a) => a.count) || [];
    this.independentAnswerCount[2] =
      this.independentAnswerCount[this.getMaxCountIndex()];
    this.independentAnswerCount[round].push(abstentions);
  }

  getMaxCountIndex() {
    return this.getSum(this.independentAnswerCount[0]) >
      this.getSum(this.independentAnswerCount[1])
      ? 0
      : 1;
  }

  updateCounterForRound() {
    this.updateCounter(this.independentAnswerCount[this.roundsToDisplay]);
  }

  prepareChartForRoundCompare(resetChart: boolean) {
    for (let i = 0; i < this.rounds - 1; i++) {
      if (resetChart) {
        this.chart.data.datasets.push({
          data: this.data[i],
          backgroundColor: this.colorLabel
            ? this.indicationColors[i]
            : this.colors[i],
        });
      } else {
        this.chart.data.datasets[i].data = this.data[i];
      }
    }
  }

  prepareChartForSingleRound(resetChart: boolean) {
    const data = this.data[this.roundsToDisplay];
    const colors = this.colorLabel
      ? this.indicationColors[this.roundsToDisplay]
      : this.colors[this.roundsToDisplay];
    if (resetChart) {
      this.chart.data.datasets.push({
        data: data,
        backgroundColor: colors,
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.chart.data.datasets[0].backgroundColor = colors;
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
    } else if (this.active) {
      /* Wait for flip animation */
      setTimeout(() => {
        this.prepareDataAndCreateChart(this.colors);
      }, 300);
    }
    this.roundsDisplayed = this.roundsToDisplay;
  }
}
