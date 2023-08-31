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
  ChartMeta,
  Element,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ContentService } from '@app/core/services/http/content.service';
import { TranslocoService } from '@ngneat/transloco';
import { ThemeService } from '@app/core/theme/theme.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { EventService } from '@app/core/services/util/event.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { PrioritizationRoundStatistics } from '@app/core/models/round-statistics';
import { StatisticChoiceComponent } from '@app/shared/statistic-content/statistic-choice/statistic-choice.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-statistic-prioritization',
  templateUrl: './statistic-prioritization.component.html',
  styleUrls: ['./statistic-prioritization.component.scss'],
})
export class StatisticPrioritizationComponent
  extends StatisticChoiceComponent
  implements OnInit, OnDestroy
{
  readonly padding = {
    label: 8,
    top: 25,
    left: 30,
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
  indexes: number[];

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService,
    protected themeService: ThemeService,
    protected eventService: EventService,
    protected presentationService: PresentationService
  ) {
    super(
      contentService,
      translateService,
      themeService,
      eventService,
      presentationService
    );
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
    this.scale = Math.min(1, 1 - 0.06 * (this.options.length - 4));
    const chartScale = Math.min(1, 1 - 0.1 * (this.options.length - 4));
    this.chartHeight = 80 * this.options.length * chartScale;
    this.fontSize = this.isPresentation ? 14 * this.scale : 12;
    this.initChart();
    this.showChart(300);
    this.updateData(stats);
    this.indexChanged.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.showChart();
    });
  }

  showChart(timeout = 0) {
    if (this.active) {
      setTimeout(() => {
        this.updateChart();
      }, timeout);
    }
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
      tickColor: this.colorStrings.background,
      drawOnChartArea: false,
    };
    const barThickness = 18 * this.scale;
    const dataSets = [
      {
        data: this.answersVisible ? this.chartData : this.emptyData,
        backgroundColor: colors,
        barThickness: barThickness,
        minBarLength: 5,
      },
    ];
    const scale = this.presentationService.getScale();
    const labels = this.options?.map((a) => this.getLabel(a.label));
    // Check if canvas element exists in DOM
    if (!document.getElementById(this.chartId)) {
      return;
    }
    Chart.defaults.color = this.colorStrings.onBackground;
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      ChartDataLabels
    );
    this.chart = new Chart(this.chartId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets,
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio * scale,
        layout: {
          padding: {
            top: this.padding.top,
            left: this.padding.left,
          },
        },
        scales: {
          x: {
            type: 'linear',
            ticks: {
              display: false,
            },
            grid: {
              drawOnChartArea: false,
              tickColor: this.colorStrings.background,
            },
            border: {
              width: 0,
            },
          },
          y: {
            type: 'category',
            ticks: {
              display: true,
              mirror: true,
              labelOffset: -(this.fontSize + 4),
              padding: this.padding.label,
              font: {
                size: this.fontSize,
              },
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
                context.dataset.data[context.dataIndex] as number
              );
            },
            display: (context) => {
              return (context.dataset.data[context.dataIndex] as number) > 0;
            },
            color: this.colorStrings.onBackground,
            anchor: 'start',
            align: 'start',
            offset: this.padding.label,
          },
        },
      },
    });
  }

  reorderChart() {
    const reorderBar = {
      id: 'reorderBar',
      beforeUpdate: (chart: Chart) => {
        if (this.active) {
          // Get data from chart
          const data: number[] = JSON.parse(
            JSON.stringify(
              this.answersVisible ? this.chartData : this.emptyData
            )
          );
          // Get array with indexes
          if (!this.indexes) {
            this.indexes = data.map((d, i) => i);
          }
          // Create copy of current indexes
          const copy = [...this.indexes];
          // Sort indexes descending according to data values
          this.indexes.sort((a, b) => data[b] - data[a]);

          // Sort data as well
          data.sort((a, b) => b - a);

          // Get current meta data, labels and colors
          const meta: ChartMeta = chart.getDatasetMeta(0);
          const newMeta: Element<object, object>[] = [];
          const labels = JSON.parse(
            JSON.stringify(this.options.map((o) => this.getLabel(o.label)))
          );
          const newLabels: string[] = [];
          const newColors: string[] = [];

          // Set new data according to sorted indexes
          meta.data.forEach((metaData, index) => {
            const newIndex = this.indexes.indexOf(index);
            newMeta[newIndex] = metaData;
            newLabels[newIndex] = labels[index];
            newColors[newIndex] = this.chartColors[index];
          });

          // Apply sorted data to chart
          chart.data.datasets[0].data = data;
          chart.data.datasets[0].backgroundColor = newColors;
          // Check if order has changed
          if (JSON.stringify(copy) !== JSON.stringify(this.indexes)) {
            meta.data = newMeta;
            chart.data.labels = newLabels;
          }
          Chart.unregister(reorderBar);
        }
      },
    };
    return reorderBar;
  }

  getDataLabel(value: number): string {
    let label: string;
    if (this.settings.contentVisualizationUnitPercent) {
      label =
        (value / (this.answerCount - this.abstentionCount)).toFixed(0) + '%';
    } else {
      label = value.toString();
    }
    return label;
  }

  initAnswerOptions(answerIndex: number) {
    const barColors = this.themeService.getBarColors();
    this.chartColors[answerIndex] = barColors[answerIndex % barColors.length];
  }

  initChart() {
    const length = this.options.length;
    this.getColors();
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
    this.chartData = (
      stats.roundStatistics[0] as PrioritizationRoundStatistics
    ).assignedPoints;
    this.emptyData = this.chartData.map(() => 0);
    this.abstentionCount = stats.roundStatistics[0].abstentionCount;
  }

  getA11yMessage(): string {
    let a11yMsg = '';
    if (this.answerCount === 0) {
      a11yMsg = this.translateService.translate('statistic.no-answers');
    } else {
      this.options.forEach((option, i) => {
        a11yMsg +=
          this.chartData[i] +
          ' ' +
          this.translateService.translate('statistic.points') +
          ': ';
        a11yMsg +=
          this.translateService.translate('statistic.answer') + (i + 1) + ': ';
        a11yMsg += option.label + ', ';
      });
    }
    return a11yMsg;
  }

  prepareChart() {
    this.chart.data.datasets[0].data = this.answersVisible
      ? this.chartData
      : this.emptyData;
    this.chart.data.datasets[0].backgroundColor = this.chartColors;
  }

  updateChart() {
    if (this.chart) {
      if (this.isCreator) {
        Chart.register(this.reorderChart());
      }
      this.prepareChart();
      if (document.getElementById(this.chartId)) {
        this.chart.update();
      }
    } else if (this.active) {
      setTimeout(() => {
        this.createHorizontalChart(this.chartColors);
      }, 0);
    }
  }

  getLabel(label: string): string | undefined {
    const chartContainer = document.getElementById('container-' + this.chartId);
    if (!chartContainer) {
      return;
    }
    const chartWidth = chartContainer.clientWidth;
    const width = this.getTextWidth(label);
    const diff =
      chartWidth - width - this.padding.label * 4 - this.padding.left;
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
