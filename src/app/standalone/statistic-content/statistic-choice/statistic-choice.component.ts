import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '@app/core/theme/theme.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { StatisticContentBaseComponent } from '@app/standalone/statistic-content/statistic-content-base';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentScale } from '@app/core/models/content-scale';
import {
  CARD_WIDTH,
  PresentationService,
} from '@app/core/services/util/presentation.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { MatIcon } from '@angular/material/icon';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
  Combination,
  RoundStatistics,
} from '@app/core/models/round-statistics';

@Component({
  selector: 'app-statistic-choice',
  templateUrl: './statistic-choice.component.html',
  styleUrls: ['./statistic-choice.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    NgClass,
    RenderedTextComponent,
    MatIcon,
    TranslocoPipe,
    CorrectAnswerResultsComponent,
  ],
})
export class StatisticChoiceComponent
  extends StatisticContentBaseComponent
  implements OnInit, OnDestroy
{
  @Input({ required: true }) content!: ContentChoice;
  @Input({ required: true }) visualizationUnitChanged!: EventEmitter<boolean>;
  @Input() directShow = false;
  @Input() isSurvey = false;
  @Input() showCorrect = false;

  chart?: Chart;
  chartId = '';
  colors: Array<string[]> = [[], []];
  indicationColors: Array<string[]> = [[], []];
  labelLetters = 'ABCDEFGHIJKL';
  data: Array<number[]> = [[], []];
  survey = false;
  options: AnswerOption[] = [];
  correctOptionIndexes: number[] = [];
  colorStrings = {
    onBackground: '',
    background: '',
    correct: '',
    wrong: '',
  };
  rounds = 1;
  roundsToDisplay = 0;
  roundsDisplayed = 0;
  ContentType: typeof ContentType = ContentType;
  roundStats?: RoundStatistics[];
  answerLabelWidth?: string;

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
    if (this.content.options) {
      this.options = [...this.content.options];
    }
    if (this.options) {
      // Calculate label width: (card with - spacing) / count of labels
      this.answerLabelWidth =
        (CARD_WIDTH - (this.options.length - 1) * 12) / this.options.length +
        'px';
    }
    if (this.content.correctOptionIndexes || !this.showCorrect) {
      this.correctOptionIndexes = this.content.correctOptionIndexes;
      this.initChart();
      this.updateData(stats);
    } else {
      this.contentService
        .getCorrectChoiceIndexes(this.content.roomId, this.content.id)
        .subscribe((correctOptionIndexes) => {
          this.correctOptionIndexes = correctOptionIndexes;
          this.initChart();
          this.updateData(stats);
        });
    }
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
    this.updateChart();
  }

  prepareDataAndCreateChart(colors: Array<string[]>) {
    Chart.defaults.color = this.colorStrings.onBackground;
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
    const dataSets = [
      {
        data: this.data[this.roundsToDisplay],
        backgroundColor: colors[this.roundsToDisplay],
      },
    ];
    if (this.roundsToDisplay > 1) {
      dataSets.push({
        data: this.data[1],
        backgroundColor: colors[1],
      });
    }
    const scale = this.presentationService.getScale();
    const labels = Array.from(this.labelLetters).slice(0, this.options.length);
    this.createChart(labels, dataSets, scale, gridConfig as GridLineOptions);
  }

  createChart(
    labels: string[],
    dataSets: ChartDataset[],
    scale: number,
    gridConfig: GridLineOptions
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
              return this.getDataLabel(
                context.dataset.data[context.dataIndex] as number,
                context.dataset.data as number[],
                this.responseCounts.answers
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

  toggleCorrect() {
    if (this.roundsDisplayed > 1) {
      for (let i = 0; i < this.roundsDisplayed; i++) {
        this.toggleChartColor(i, i);
      }
    } else {
      this.toggleChartColor(0, this.roundsDisplayed);
    }
    if (this.chart) {
      this.chart.update();
    }
    this.showCorrect = !this.showCorrect;
  }

  toggleChartColor(dataSetIndex: number, roundIndex: number) {
    const dataset = this.chart?.config.data.datasets[
      dataSetIndex
    ] as BarControllerDatasetOptions;
    dataset.backgroundColor = this.showCorrect
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
    this.colorStrings.wrong = this.themeService.getColor('grey');
  }

  initRoundAnswerOptions(answerIndex: number) {
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
          this.indicationColors[j][answerIndex] = this.colorStrings.wrong;
        }
      }
    }
  }

  initChart() {
    this.getColors();
    this.options.forEach((value, index) => {
      this.initRoundAnswerOptions(index);
    });
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
    }
  }

  setData(stats: AnswerStatistics, roundIndex: number) {
    if (!this.roundStats) {
      this.roundStats = stats.roundStatistics;
    } else {
      this.roundStats[roundIndex] = stats.roundStatistics[roundIndex];
    }
    this.data[roundIndex] = stats.roundStatistics[roundIndex].independentCounts;
    this.updateCounterForRound(roundIndex);
  }

  updateCounterForRound(round: number) {
    if (!this.roundStats) {
      return;
    }
    const index = round > 1 ? 1 : round;
    this.updateCounter({
      answers: this.roundStats[index].answerCount ?? 0,
      abstentions: this.roundStats[index].abstentionCount ?? 0,
    });
  }

  prepareChartForRoundCompare(resetChart: boolean) {
    for (let i = 0; i < this.rounds - 1; i++) {
      if (resetChart) {
        this.chart?.data.datasets.push({
          data: this.data[i],
          backgroundColor: this.showCorrect
            ? this.indicationColors[i]
            : this.colors[i],
        });
      } else {
        if (this.chart) {
          this.chart.data.datasets[i].data = this.data[i];
        }
      }
    }
  }

  prepareChartForSingleRound(resetChart: boolean) {
    const data = this.data[this.roundsToDisplay];
    const colors = this.showCorrect
      ? this.indicationColors[this.roundsToDisplay]
      : this.colors[this.roundsToDisplay];
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
        this.prepareDataAndCreateChart(
          this.showCorrect && this.correctOptionIndexes.length > 0
            ? this.indicationColors
            : this.colors
        );
      }, 300);
    }
    this.roundsDisplayed = this.roundsToDisplay;
  }

  getAbstentionCounts(): number[] | undefined {
    if (this.roundStats) {
      return this.roundStats.map((s) => s.abstentionCount);
    }
  }

  getAnswerCounts(): number[] | undefined {
    if (this.roundStats) {
      return this.roundStats.map((s) => s.answerCount);
    }
  }

  private isCombinationCorrect(combination: Combination): boolean {
    return (
      combination.selectedChoiceIndexes.every((i) => this.checkIfCorrect(i)) &&
      this.correctOptionIndexes.length ===
        combination.selectedChoiceIndexes.length
    );
  }

  getCorrectAnswerCounts(): number[] | undefined {
    if (!this.roundStats) {
      return;
    }
    if (this.content.multiple) {
      return this.roundStats.map((s) =>
        s.combinatedCounts
          ? (s.combinatedCounts.find((c) => this.isCombinationCorrect(c))
              ?.count ?? 0)
          : 0
      );
    } else {
      return this.roundStats.map(
        (s) => s.independentCounts.find((c, i) => this.checkIfCorrect(i))!
      );
    }
  }
}
