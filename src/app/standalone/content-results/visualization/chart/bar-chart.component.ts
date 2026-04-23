import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';

import {
  Chart,
  ChartOptions,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { VisualizationData } from '@app/standalone/content-results/visualization/visualization-data';
import { ThemeService } from '@app/core/theme/theme.service';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);

@Component({
  selector: 'app-bar-chart',
  template: `<canvas class="chart" #canvas></canvas>`,
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
      })),
    };
  });
  showLegend = input(false);
  showLabels = input(false);
  scale = input(1);
  totalValue = input<number | undefined>(undefined);
  dataLabelMode = input<'absolute' | 'percent'>('absolute');
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  private readonly themeService = inject(ThemeService);

  bgColor = computed(() => this.themeService.getColor('surface'));
  fgColor = computed(() => this.themeService.getColor('on-surface'));

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.chart?.destroy();
      this.chart = undefined;
    });
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      if (!canvas) return;
      const data = this.chartData();
      const options = this.options();
      this.chart?.destroy();
      this.chart = new Chart(canvas, {
        type: 'bar',
        data,
        options,
      });
    });
  }

  private options = computed<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,

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
          color: this.showLegend() ? this.fgColor() : this.bgColor(),
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
        display: this.showLegend(),
      },

      datalabels: {
        formatter: (_: unknown, context: any) => {
          const values = context.dataset.data as number[];
          const value = values[context.dataIndex];

          return this.formatDataLabel(value, values, this.totalValue());
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
    let label: string;
    const total = count ?? roundData.reduce((a, b) => a + b, 0);
    if (this.dataLabelMode() === 'percent') {
      value = total ? (value / total) * 100 : 0;
      label = value.toFixed(0) + '\u202F%';
    } else {
      label = value.toString();
    }
    return label;
  }
}
