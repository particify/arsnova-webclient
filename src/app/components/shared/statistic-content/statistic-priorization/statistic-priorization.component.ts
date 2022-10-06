import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@arsnova/theme/theme.service';
import { AnswerStatistics } from '@arsnova/app/models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { EventService } from '@arsnova/app/services/util/event.service';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';
import { ContentPriorization } from '@arsnova/app/models/content-priorization';
import { PriorizationRoundStatistics } from '@arsnova/app/models/round-statistics';
import { StatisticChoiceComponent } from '../statistic-choice/statistic-choice.component';

@Component({
  selector: 'app-statistic-priorization',
  templateUrl: './statistic-priorization.component.html',
  styleUrls: ['./statistic-priorization.component.scss']
})
export class StatisticPriorizationComponent extends StatisticChoiceComponent implements OnInit, OnDestroy {

  @Input() content: ContentPriorization;

  chartColors: string[] = [];
  chartData: number[] = [];
  emptyData: number[] = [];
  answerCount: number;
  abstentionCount: number;
  chartHeight: number;
  maxChartHeight: number;

  constructor(protected contentService: ContentService,
              protected translateService: TranslateService,
              protected themeService: ThemeService,
              protected eventService: EventService,
              protected presentationService: PresentationService) {
    super(contentService, translateService, themeService, eventService, presentationService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  init() {
    this.chartId = 'chart-' + this.content.id;
    if (this.content.options) {
      this.options = [...this.content.options];
    }
    const chartScale = this.options.length < 5 ? 1 : (1 + 0.1 * (this.options.length - 4));
    this.chartHeight = 40 * chartScale;
    this.maxChartHeight = 320 * chartScale;
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

  deleteAnswers() {
    this.chartData = [];
    this.updateChart();
  }

  toggleAnswers(visible?: boolean): boolean {
    this.answersVisible = visible ?? !this.answersVisible;
    this.updateChart();
    return this.answersVisible;
  }

  createHorizontalChart(colors: string[]) {
    const optionScale = this.options.length < 5 ? 1 : (1 - 0.05 * (this.options.length - 4));
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.defaults.font.size = this.isPresentation ? 14 * optionScale : 12;
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartDataLabels);
    const gridConfig = {
      borderColor: this.colorStrings.onBackground,
      tickColor: this.colorStrings.background,
      drawOnChartArea: false,
      z: 1
    };
    const barThickness = 20 * optionScale;
    const dataSets = [
      {
        data: this.answersVisible ? this.chartData : this.emptyData,
        backgroundColor: colors,
        barThickness: barThickness,
        minBarLength: 5
      }
    ];
    const scale = this.presentationService.getScale();
    const chartWidth = document.getElementsByClassName('chart-container')[0].clientWidth;
    const labels = this.options.map(a => a.label);
    labels.forEach((value, index) => {
      labels[index] = this.getLabel(value, this.isPresentation ? 14 * optionScale : 12, chartWidth);
    });
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: 25,
            left: 30
          }
        },
        scales: {
          x: {
            type: 'linear',
            ticks: {
              display: false
            },
            grid: {
              drawOnChartArea: false,
              tickColor: this.colorStrings.background,
              borderWidth: 0
            }
          },
          y: {
            type: 'category',
            ticks: {
              display: true,
              mirror: true,
              labelOffset: - (20 * optionScale),
              padding: 8
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
            anchor: 'start',
            align: 'start',
            offset: 8
          }
        }
      }
    });
  }

  getDataLabel(value): string {
    let label: string;
    if (this.settings.contentVisualizationUnitPercent) {
      label = (value / (this.answerCount - this.abstentionCount)).toFixed(0) + '%';
    } else {
      label = value;
    }
    return label;
  }

  initAnswerOptions(answerIndex: number) {
    const barColors = this.themeService.getBarColors();
    this.chartColors[answerIndex] = barColors[answerIndex % barColors.length].color;
  }

  initChart() {
    const length = this.options.length;
    const theme = this.themeService.getCurrentThemeName();
    const currentTheme = this.themeService.getThemeByKey(theme);
    this.getColors(currentTheme);
    for (let i = 0; i < length; i++) {
      this.initAnswerOptions(i);
    }
  }

  updateData(stats: AnswerStatistics) {
    if (stats) {
        this.setData(stats);
    } else {
      this.answerCount = 0;
    }
    this.updateCounter([stats.roundStatistics[0].answerCount]);
  }

  setData(stats: AnswerStatistics) {
    this.chartData = (stats.roundStatistics[0] as PriorizationRoundStatistics).assignedPoints;
    this.emptyData = this.chartData.map(() => 0);
    this.abstentionCount = stats.roundStatistics[0].abstentionCount;
  }

  prepareChart() {
    this.chart.data.datasets[0].data = this.answersVisible ? this.chartData : this.emptyData;
    this.chart.data.datasets[0].backgroundColor = this.chartColors;
  }

  updateChart() {
    if (this.chart) {
      this.prepareChart();
      this.chart.update();
    } else if (this.active) {
      /* Wait for flip animation */
      setTimeout(() => {
        this.createHorizontalChart(this.chartColors);
      }, 300);
    }
  }

  getLabel(label: string, fontSize, chartWidth: number): string {
    const width = this.getLabelTextWidth(label, fontSize);
    const diff = chartWidth - width - 8 - 30 - 20;
    if (diff >= 0) {
      return label;
    } else {
      return this.getLabel(label.substring(0, label.length - 3) + '…', fontSize, chartWidth);
    }
  }

  getLabelTextWidth(label: string, fontSize: number) {
    const element = document.createElement('div');
    document.body.appendChild(element);
    element.style.fontSize = fontSize + 'px';
    element.style.position = 'absolute';
    element.style.left = -1000 + 'px';
    element.style.top = -1000 + 'px';
    element.textContent = label;
    const width = element.clientWidth;
    document.body.removeChild(element);
    return width;
  }
}
