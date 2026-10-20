import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  Chart,
  ChartOptions,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  DataLabelMode,
  dataLabel,
} from '@app/standalone/content-results/visualization/data-label';
import { VisualizationData } from '@app/standalone/content-results/visualization/visualization-data';
import { ThemeService } from '@app/core/theme/theme.service';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartDataLabels
);

@Component({
  selector: 'app-bar-chart',
  template: ` <div
    [style.height]="scale() > 1 ? '28vh' : '40vh'"
    [style.maxHeight]="scale() > 1 ? '180px' : '500px'"
  >
    <canvas style="max-height: 100%; max-width: 100%" #canvas></canvas>
  </div>`,
})
export class BarChartComponent {
  data = input.required<VisualizationData>();
  private chartData = computed(() => {
    const data = this.data();
    return {
      labels: data.labels,
      datasets: data.datasets.map((ds) => ({
        data: ds.values,
        backgroundColor: ds.colors ?? [],
        label: ds.label,
      })),
    };
  });
  showLegend = input(false);
  showLabels = input(false);
  /**
   * Keeps the x-axis labels legible where `showLegend` would hide them with the
   * rest of the axis chrome, for formats whose labels carry the values.
   */
  alwaysShowXAxisLabels = input(false);
  /** One title per bar; without them the chart has no tooltips. */
  tooltipTitles = input<string[] | undefined>(undefined);
  scale = input(1);
  totalValue = input<number | undefined>(undefined);
  dataLabelMode = input<DataLabelMode>('absolute');
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  private readonly themeService = inject(ThemeService);
  private readonly theme = toSignal(this.themeService.getCurrentTheme$());

  bgColor = computed(() => {
    this.theme();
    return this.themeService.getColor('surface');
  });
  fgColor = computed(() => {
    this.theme();
    return this.themeService.getColor('on-surface');
  });

  constructor() {
    afterRenderEffect((onCleanup) => {
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;
      if (this.chart) return;
      const data = untracked(() => this.chartData());
      const options = untracked(() => this.options());
      this.chart = new Chart(canvas, { type: 'bar', data, options });
      this.chart.resize();
      onCleanup(() => {
        this.chart?.destroy();
        this.chart = undefined;
      });
    });
    effect(() => {
      const data = this.chartData();
      if (!this.chart) return;
      this.chart.data.labels = data.labels;
      // Chart.js keeps a dataset's bars only while the dataset object stays
      // the same; a new object makes them grow in from zero again.
      const datasets = this.chart.data.datasets;
      data.datasets.forEach((newDataset, i) => {
        if (datasets[i]) {
          Object.assign(datasets[i], newDataset);
        } else {
          datasets.push({ ...newDataset });
        }
      });
      datasets.length = data.datasets.length;
      this.chart.update();
    });
    effect(() => {
      const options = this.options();
      // Read by the data label formatter while the chart renders.
      this.dataLabelMode();
      this.totalValue();
      if (!this.chart) return;
      this.chart.options = options;
      this.chart.update();
    });
  }

  private options = computed<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio * this.scale(),
    layout: {
      padding: {
        top: 25,
        left: !this.showLegend() ? -10 : 0,
      },
    },

    scales: {
      x: {
        grid: {
          tickColor: this.showLegend() ? this.fgColor() : this.bgColor(),
          drawOnChartArea: this.showLegend(),
        },
        ticks: {
          display: this.showLabels(),
          color:
            this.showLegend() || this.alwaysShowXAxisLabels()
              ? this.fgColor()
              : this.bgColor(),
        },
        border: {
          color: this.fgColor(),
        },
      },
      y: {
        ticks: {
          display: this.showLegend(),
          precision: 0,
          color: this.showLegend() ? this.fgColor() : this.bgColor(),
        },
        grid: {
          tickColor: this.showLegend() ? this.fgColor() : this.bgColor(),
          drawOnChartArea: this.showLegend(),
        },
        border: {
          width: this.showLegend() ? 1 : 0,

          color: this.fgColor(),
        },
      },
    },

    plugins: {
      legend: {
        display: this.showLegend() || this.data().datasets.length > 1,
      },

      tooltip: {
        enabled: !!this.tooltipTitles(),
        mode: 'point',
        displayColors: false,
        titleMarginBottom: 0,
        bodyFont: { size: 0 },
        callbacks: {
          title: (items) => this.tooltipTitles()?.[items[0].dataIndex] ?? '',
        },
      },

      datalabels: {
        formatter: (_: unknown, context: any) => {
          const values = context.dataset.data as number[];
          const value = values[context.dataIndex];

          // Chart.js formats while rendering, which may happen inside an
          // effect; tracking these reads there would make the effect that
          // created the chart destroy and rebuild it.
          return untracked(() =>
            this.formatDataLabel(value, values, this.totalValue())
          );
        },
        color: this.fgColor(),
        anchor: 'end',
        align: 'end',
      },
    },
  }));

  private formatDataLabel(
    value: number,
    roundData: number[],
    count?: number
  ): string {
    const total = count ?? roundData.reduce((a, b) => a + b, 0);
    return dataLabel(value, total, this.dataLabelMode());
  }
}
