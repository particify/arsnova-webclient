import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartDataset,
  ChartTypeRegistry,
  GridLineOptions,
  LinearScale,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '@app/core/theme/theme.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { takeUntil } from 'rxjs';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericRoundStatistics } from '@app/core/models/round-statistics';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { StatisticInfoComponent } from '@app/standalone/statistic-info/statistic-info.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';

const MAX_BARS = 15;
const LEGEND_LOCALIZATION_START = 10_000;

interface AnswerGroup {
  groupStart: number;
  groupEnd: number;
  count: number;
}

@Component({
  selector: 'app-statistic-numeric',
  templateUrl: './statistic-numeric.component.html',
  styleUrls: ['./statistic-numeric.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    NgClass,
    StatisticInfoComponent,
    MatIcon,
    MatDivider,
    TranslocoPipe,
    CorrectAnswerResultsComponent,
  ],
})
export class StatisticNumericComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) content!: ContentNumeric;
  @Input({ required: true }) visualizationUnitChanged!: EventEmitter<boolean>;
  @Input() directShow = false;
  @Input() showCorrect = false;

  chart?: Chart;
  chartId = '';
  colors: Array<string[]> = [[], []];
  data: Array<AnswerGroup[]> = [[], []];
  colorStrings = {
    onBackground: '',
    background: '',
    correct: '',
    abstention: '',
  };
  rounds = 1;
  roundsToDisplay = 0;
  roundsDisplayed = 0;
  roundStats?: NumericRoundStatistics[];
  statInfos: Array<keyof NumericRoundStatistics> = [
    'mean',
    'median',
    'standardDeviation',
    'variance',
    'minimum',
    'maximum',
  ];

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService,
    protected themeService: ThemeService,
    protected presentationService: PresentationService
  ) {
    super(contentService, translateService);
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
    this.updateData(stats);
    this.initChart();
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
      if (this.chart) {
        this.chart.update();
      }
    });
  }

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    if (this.answersVisible) {
      this.updateChart();
    }
    return this.answersVisible;
  }

  deleteAnswers() {
    this.data = [[], []];
    this.roundStats = [];
    this.updateCounterForRound();
    this.updateChart();
  }

  private prepareDataAndCreateChart(colors: Array<string[]>) {
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.defaults.font.size = this.isPresentation ? 14 : 16;
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      ChartDataLabels
    );

    const gridConfig = {
      tickColor: this.isPresentation
        ? this.colorStrings.background
        : this.colorStrings.onBackground,
      drawOnChartArea: !this.isPresentation,
    };
    const dataSets = [
      {
        data: this.getGroupCounts(this.data[this.roundsToDisplay]),
        backgroundColor: colors[this.roundsToDisplay],
      },
    ];
    if (this.compareRounds()) {
      dataSets.push({
        data: this.getGroupCounts(this.data[1]),
        backgroundColor: colors[1],
      });
    }
    const scale = this.presentationService.getScale();
    const labels = this.data[0].map((r) =>
      this.getFormattedLabel(r.groupStart)
    );
    // Check if step size is larger than 1
    const showToolTips =
      this.data[0][0].groupStart !== this.data[0][0].groupEnd;
    this.createChart(
      labels,
      dataSets,
      scale,
      gridConfig as GridLineOptions,
      showToolTips
    );
  }

  private getGroupCounts(answerGroups: AnswerGroup[]): number[] {
    return answerGroups.map((a) => a.count);
  }

  private groupAnswerResults(
    roundStats: NumericRoundStatistics
  ): AnswerGroup[] {
    const minNumber = this.content.minNumber;
    const maxNumber = this.content.maxNumber;
    const range = maxNumber - minNumber + 1;
    const maxGroups = Math.min(MAX_BARS, range);

    // Calculate group size using factors of 1, 2, and 5
    let groupSize = 1;
    let factorIndex = 0;

    while (range / groupSize > maxGroups) {
      groupSize *= [2, 5][factorIndex];
      factorIndex = (factorIndex + 1) % 2;
    }

    // Calculate the initial group start to ensure it starts with 0 or one of the factors above
    const initialGroupStart = Math.floor(minNumber / groupSize) * groupSize;

    const groupedData: AnswerGroup[] = [];
    let count = 0;
    while (
      groupedData.length === 0 ||
      groupedData[groupedData.length - 1].groupEnd < maxNumber
    ) {
      const groupStart = initialGroupStart + count * groupSize;
      const groupEnd = groupStart + groupSize - 1;
      const group: AnswerGroup = {
        groupStart: groupStart,
        groupEnd: groupEnd,
        count: 0,
      };
      const counts = roundStats.independentCounts;
      if (counts) {
        const count = counts.reduce(
          (acc, count, i) =>
            acc +
            (roundStats.selectedNumbers[i] >= groupStart &&
            roundStats.selectedNumbers[i] <= groupEnd
              ? count
              : 0),
          0
        );
        group.count = count;
      }
      groupedData.push(group);
      count++;
    }

    return groupedData;
  }

  private createChart(
    labels: string[],
    dataSets: ChartDataset[],
    scale: number,
    gridConfig: GridLineOptions,
    showToolTips: boolean
  ) {
    // Check if canvas element exists in DOM
    if (!document.getElementById(this.chartId)) {
      return;
    }
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: this.isPresentation
          ? window.devicePixelRatio * scale
          : undefined,
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
              font: {
                size: 12,
              },
            },
            grid: gridConfig,
            border: {
              color: this.colorStrings.onBackground,
            },
            display: true,
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            mode: 'point',
            enabled: showToolTips,
            displayColors: false,
            titleMarginBottom: 0,
            bodyFont: {
              size: 0,
            },
            callbacks: {
              title: (items) => this.getTooltipTitle(items[0]),
            },
          },
          datalabels: {
            formatter: (value, context) => {
              return this.getDataLabel(
                context.dataset.data[context.dataIndex] as number,
                context.dataset.data as number[]
              );
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

  protected getTooltipTitle(
    item: TooltipItem<keyof ChartTypeRegistry>
  ): string {
    const group = this.data[item.datasetIndex][item.dataIndex];
    return group.groupStart + '–' + group.groupEnd;
  }

  private getFormattedLabel(label: number): string {
    if (
      label < LEGEND_LOCALIZATION_START &&
      label > -LEGEND_LOCALIZATION_START
    ) {
      return label.toString();
    } else {
      return Intl.NumberFormat(this.translateService.getActiveLang(), {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(label);
    }
  }

  toggleCorrect() {
    this.showCorrect = !this.showCorrect;
  }

  private getColors() {
    this.colorStrings.onBackground = this.themeService.getColor('on-surface');
    this.colorStrings.background = this.themeService.getColor('surface');
    this.colorStrings.correct = this.themeService.getColor('green');
    this.colorStrings.abstention = this.themeService.getColor('grey');
  }

  private initRoundAnswerOptions(answerIndex: number) {
    for (let j = 0; j < this.rounds; j++) {
      this.colors[j][answerIndex] = this.themeService.getBarColors()[0];
    }
  }

  private initChart() {
    const length = this.data[0].length;
    this.getColors();
    for (let i = 0; i < length; i++) {
      this.initRoundAnswerOptions(i);
    }
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
      if (!this.roundStats) {
        this.roundStats = stats.roundStatistics as NumericRoundStatistics[];
      }
      if (this.rounds > 1) {
        for (let i = 0; i < this.rounds; i++) {
          if (stats.roundStatistics[i]) {
            this.setData(stats, i);
            this.roundStats[i] = (
              stats.roundStatistics as NumericRoundStatistics[]
            )[i];
          }
        }
      } else {
        this.setData(stats, this.roundsToDisplay);
        this.roundStats[this.roundsToDisplay] = (
          stats.roundStatistics as NumericRoundStatistics[]
        )[this.roundsToDisplay];
      }
    }
    this.updateCounterForRound();
  }

  private setData(stats: AnswerStatistics, roundIndex: number) {
    const roundStats = stats.roundStatistics[
      roundIndex
    ] as NumericRoundStatistics;
    this.data[roundIndex] = this.groupAnswerResults(roundStats);
  }

  updateCounterForRound() {
    if (!this.roundStats) {
      return;
    }
    if (this.compareRounds()) {
      const index =
        this.roundStats[0]?.answerCount > this.roundStats[1]?.answerCount
          ? 0
          : 1;
      this.responseCounts.answers = this.roundStats[index]?.answerCount;
      this.responseCounts.abstentions = this.roundStats[index].abstentionCount;
    } else {
      this.responseCounts.answers =
        this.roundStats[this.roundsToDisplay].answerCount;
      this.responseCounts.abstentions =
        this.roundStats[this.roundsToDisplay].abstentionCount;
    }
    this.updateCounterEvent.emit(this.responseCounts);
  }

  private prepareChartForRoundCompare(resetChart: boolean) {
    for (let i = 0; i < this.rounds - 1; i++) {
      const data = this.getGroupCounts(this.data[i]);
      if (resetChart) {
        this.chart?.data.datasets.push({
          data: data,
          backgroundColor: this.colors[i],
        });
      } else {
        if (this.chart) {
          this.chart.data.datasets[i].data = data;
        }
      }
    }
  }

  private prepareChartForSingleRound(resetChart: boolean) {
    const data = this.getGroupCounts(this.data[this.roundsToDisplay]);
    const colors = this.colors[this.roundsToDisplay];
    if (resetChart) {
      this.chart?.data.datasets.push({
        data: data,
        backgroundColor: colors,
      });
    } else {
      if (this.chart) {
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].backgroundColor = colors;
      }
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

  getInfoStats(name: keyof NumericRoundStatistics): number[] {
    if (this.roundStats) {
      return this.roundStats.map((r) => r[name]) as number[];
    }
    return [];
  }

  compareRounds(): boolean {
    return this.roundsToDisplay > 1;
  }

  getAnswerCounts(): number[] | undefined {
    if (this.roundStats) {
      return this.roundStats.map((s) => s.answerCount);
    }
  }

  getAbstentionCounts(): number[] | undefined {
    if (this.roundStats) {
      return this.roundStats.map((s) => s.abstentionCount);
    }
  }

  getCorrectAnswerFractions(): number[] | undefined {
    if (this.roundStats) {
      return this.roundStats.map((s) => s.correctAnswerFraction);
    }
  }
}
