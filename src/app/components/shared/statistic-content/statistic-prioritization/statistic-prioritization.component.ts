import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentService } from '@arsnova/app/services/http/content.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@arsnova/theme/theme.service';
import { AnswerStatistics } from '@arsnova/app/models/answer-statistics';
import { takeUntil } from 'rxjs/operators';
import { EventService } from '@arsnova/app/services/util/event.service';
import { PresentationService } from '@arsnova/app/services/util/presentation.service';
import { ContentPrioritization } from '@arsnova/app/models/content-prioritization';
import { PrioritizationRoundStatistics } from '@arsnova/app/models/round-statistics';
import { StatisticChoiceComponent } from '../statistic-choice/statistic-choice.component';

@Component({
  selector: 'app-statistic-prioritization',
  templateUrl: './statistic-prioritization.component.html',
  styleUrls: ['./statistic-prioritization.component.scss']
})
export class StatisticPrioritizationComponent extends StatisticChoiceComponent implements OnInit, OnDestroy {

  readonly padding = {
    label: 8,
    top: 25,
    left: 30
  };

  @Input() content: ContentPrioritization;
  @Input() indexChanged: EventEmitter<number> = new EventEmitter<number>();
  @Input() isCreator = true;

  chartColors: string[] = [];
  chartData: number[] = [];
  emptyData: number[] = [];
  answerCount: number;
  abstentionCount: number;
  chartHeight: number;
  scale: number;
  fontSize: number;

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

  init(stats: AnswerStatistics) {
    this.chartId = 'chart-' + this.content.id;
    if (this.content.options) {
      this.options = [...this.content.options];
    }
    this.scale = Math.min(1, 1 - 0.06  * (this.options.length - 4));
    const chartScale = Math.min(1, 1 - 0.1 * (this.options.length - 4));
    this.chartHeight = 80 * this.options.length * chartScale;
    this.fontSize = this.isPresentation ? 14 * this.scale : 12;
    this.initChart();
    this.indexChanged.subscribe(() => {
      if (this.active) {
        setTimeout(() => {
          this.updateChart();
        }, 0);
      }
    });
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
    const gridConfig = {
      borderColor: this.colorStrings.onBackground,
      tickColor: this.colorStrings.background,
      drawOnChartArea: false,
      z: 1
    };
    const barThickness = 18 * this.scale;
    const dataSets = [
      {
        data: this.answersVisible ? this.chartData : this.emptyData,
        backgroundColor: colors,
        barThickness: barThickness,
        minBarLength: 5
      }
    ];
    const scale = this.presentationService.getScale();
    const labels = this.options.map(a => this.getLabel(a.label));
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartDataLabels);
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: this.padding.top,
            left: this.padding.left
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
              labelOffset: - (this.fontSize + 4),
              padding: this.padding.label,
              font: {
                size: this.fontSize
              }
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
            offset: this.padding.label
          }
        }
      }
    });
  }

  reorderChart() {
    const reorderBar = {
      id: 'reorderBar',
      beforeUpdate: (chart) => {
        if (this.active) {
          // Get data from chart
          const data = JSON.parse(JSON.stringify(this.answersVisible ? this.chartData : this.emptyData));
          // Get array with indexes
          const indexes = data.map((d, i) => i);
          // Sort indexes descending according to data values
          indexes.sort((a, b) => data[b] - data[a]);
          // Sort data as well
          data.sort((a, b) => b - a);

          // Get current meta data, labels and colors
          const meta = chart.getDatasetMeta(0);
          const newMeta = [];
          const labels = JSON.parse(JSON.stringify(this.options.map(o => this.getLabel(o.label))));
          const newLabels = [];
          const newColors = [];

          // Set new data according to sorted indexes
          meta.data.forEach((data, index) => {
            const newIndex = indexes.indexOf(index);
            newMeta[newIndex] = data;
            newLabels[newIndex] = labels[index];
            newColors[newIndex] = this.chartColors[index];
          });

          // Apply sorted data to chart
          meta.data = newMeta;
          chart.data.labels = newLabels;
          chart.data.datasets[0].data = data;
          chart.data.datasets[0].backgroundColor = newColors;
          Chart.unregister(reorderBar);
        }
      }
    };
    return reorderBar;
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
    this.chartData = (stats.roundStatistics[0] as PrioritizationRoundStatistics).assignedPoints;
    this.emptyData = this.chartData.map(() => 0);
    this.abstentionCount = stats.roundStatistics[0].abstentionCount;
  }

  getA11yMessage(): string {
    let a11yMsg = '';
    if (this.answerCount === 0) {
      a11yMsg = this.translateService.instant('statistic.no-answers');
    } else {
      this.options.forEach((option, i) => {
        a11yMsg += this.chartData[i] + ' ' + this.translateService.instant('statistic.points') + ': ';
        a11yMsg += this.translateService.instant('statistic.answer') + (i + 1) + ': ';
        a11yMsg += option.label + ', ';
      });
    }
    return a11yMsg;
  }

  prepareChart() {
    this.chart.data.datasets[0].data = this.answersVisible ? this.chartData : this.emptyData;
    this.chart.data.datasets[0].backgroundColor = this.chartColors;
  }

  updateChart() {
    if (this.chart) {
      if (this.isCreator) {
        Chart.register(this.reorderChart());
      }
      this.prepareChart();
      this.chart.update();
    } else if (this.active) {
      setTimeout(() => {
        this.createHorizontalChart(this.chartColors);
      }, 0);
    }
  }

  getLabel(label: string): string {
    const chartWidth = document.getElementById('container-' + this.chartId).clientWidth;
    const width = this.getTextWidth(label);
    const diff = chartWidth - width - this.padding.label * 4 - this.padding.left;
    if (diff >= 0) {
      return label;
    } else {
      return this.getLabel(label.substring(0, label.length - 3) + '…');
    }
  }

  getTextWidth(label: string) {
    const element = document.createElement('div');
    document.body.appendChild(element);
    element.style.fontSize = this.fontSize + 'px';
    element.style.position = 'absolute';
    element.style.left = -1000 + 'px';
    element.style.top = -1000 + 'px';
    element.textContent = label;
    const width = element.clientWidth;
    document.body.removeChild(element);
    return width;
  }
}
