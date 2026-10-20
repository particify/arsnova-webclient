import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { configureTestModule } from '@testing/test.setup';
import { Chart } from 'chart.js';
import { BehaviorSubject } from 'rxjs';
import { VisualizationData } from '@app/standalone/content-results/visualization/visualization-data';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
  let fixture: ComponentFixture<BarChartComponent>;
  let theme$: BehaviorSubject<Theme>;

  const oneRound: VisualizationData = {
    labels: ['A', 'B', 'C'],
    datasets: [{ values: [1, 2, 1], colors: ['red', 'green', 'blue'] }],
  };

  const twoRounds: VisualizationData = {
    labels: ['A', 'B', 'C'],
    datasets: [
      { values: [1, 2, 1], colors: ['red'], label: 'Round 1' },
      { values: [3, 0, 1], colors: ['red'], label: 'Round 2' },
    ],
  };

  function setUp(
    data: VisualizationData,
    inputs: Record<string, unknown> = {}
  ) {
    theme$ = new BehaviorSubject<Theme>(Theme.LIGHT);
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getColor',
      'getCurrentTheme$',
    ]);
    themeService.getCurrentTheme$.and.returnValue(theme$);
    themeService.getColor.and.callFake((name: string) =>
      theme$.value === Theme.LIGHT ? name : `dark-${name}`
    );
    configureTestModule(
      [BarChartComponent],
      [{ provide: ThemeService, useValue: themeService }]
    ).compileComponents();
    fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('data', data);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function chart(): Chart {
    const canvas = fixture.nativeElement.querySelector('canvas');
    return Chart.getChart(canvas)!;
  }

  function dataLabel(datasetIndex: number, dataIndex: number): string {
    // The raw options, as the resolved ones call scriptable options on access.
    const formatter = (
      chart().config.options?.plugins as {
        datalabels: {
          formatter: (value: unknown, context: unknown) => string;
        };
      }
    ).datalabels.formatter;
    return formatter(undefined, {
      dataIndex,
      dataset: chart().data.datasets[datasetIndex],
    });
  }

  it('draws one dataset per round', () => {
    setUp(twoRounds);

    expect(chart().data.datasets.map((d) => d.label)).toEqual([
      'Round 1',
      'Round 2',
    ]);
    expect(chart().data.datasets[1].data).toEqual([3, 0, 1]);
  });

  it('shows no legend for a single round', () => {
    setUp(oneRound);

    expect(chart().config.options?.plugins?.legend?.display).toBeFalse();
  });

  it('shows the legend to tell compared rounds apart', () => {
    setUp(twoRounds);

    expect(chart().config.options?.plugins?.legend?.display).toBeTrue();
  });

  it('updates the drawn values in place', () => {
    setUp(oneRound);
    const drawn = chart();

    fixture.componentRef.setInput('data', {
      ...oneRound,
      datasets: [{ values: [4, 0, 2], colors: ['red', 'green', 'blue'] }],
    });
    fixture.detectChanges();

    expect(chart()).toBe(drawn);
    expect(chart().data.datasets[0].data).toEqual([4, 0, 2]);
  });

  it('keeps the bars of a dataset when its values change', async () => {
    setUp(oneRound);
    // Chart.js lays the bars out once the canvas is attached.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const bar = chart().getDatasetMeta(0).data[0];
    expect(bar).toBeDefined();

    fixture.componentRef.setInput('data', {
      ...oneRound,
      datasets: [{ values: [4, 0, 2], colors: ['red', 'green', 'blue'] }],
    });
    fixture.detectChanges();

    expect(chart().getDatasetMeta(0).data[0]).toBe(bar);
  });

  it('adds and removes a compared round', () => {
    setUp(oneRound);

    fixture.componentRef.setInput('data', twoRounds);
    fixture.detectChanges();
    expect(chart().data.datasets.length).toBe(2);

    fixture.componentRef.setInput('data', oneRound);
    fixture.detectChanges();
    expect(chart().data.datasets.length).toBe(1);
  });

  it('labels the bars with the absolute counts', () => {
    setUp(oneRound);

    expect(dataLabel(0, 1)).toBe('2');
  });

  it('labels the bars with the share of a round in percent', () => {
    setUp(oneRound, { dataLabelMode: 'percent' });

    expect(dataLabel(0, 1)).toBe('50 %');
  });

  it('relates the shares to the respondents of a multiple choice', () => {
    setUp(
      { labels: ['A', 'B', 'C'], datasets: [{ values: [2, 1, 1] }] },
      { dataLabelMode: 'percent', totalValue: 2 }
    );

    expect([0, 1, 2].map((i) => dataLabel(0, i))).toEqual([
      '100 %',
      '50 %',
      '50 %',
    ]);
  });

  it('applies a changed option to the chart', () => {
    setUp(oneRound);
    expect(chart().options.plugins?.legend?.display).toBeFalse();

    fixture.componentRef.setInput('showLegend', true);
    fixture.detectChanges();

    expect(chart().options.plugins?.legend?.display).toBeTrue();
  });

  it('keeps the bars when the data label mode changes', async () => {
    setUp(oneRound);
    // Chart.js lays the bars out once the canvas is attached.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const bar = chart().getDatasetMeta(0).data[0];
    expect(bar).toBeDefined();
    const update = spyOn(chart(), 'update').and.callThrough();

    fixture.componentRef.setInput('dataLabelMode', 'percent');
    fixture.detectChanges();

    expect(update).toHaveBeenCalled();
    expect(chart().getDatasetMeta(0).data[0]).toBe(bar);
  });

  it('recolours the chart when the theme changes', () => {
    setUp(oneRound);
    expect(chart().options.plugins?.datalabels?.color).toBe('on-surface');

    theme$.next(Theme.DARK);
    fixture.detectChanges();

    expect(chart().options.plugins?.datalabels?.color).toBe('dark-on-surface');
  });

  it('labels an empty round with 0 % instead of dividing by zero', () => {
    setUp(
      { labels: ['A'], datasets: [{ values: [0] }] },
      { dataLabelMode: 'percent' }
    );

    expect(dataLabel(0, 0)).toBe('0 %');
  });

  it('keeps the x-axis labels legible without a legend when asked to', () => {
    setUp(oneRound, { alwaysShowXAxisLabels: true });

    const x = chart().config.options?.scales?.['x'] as {
      ticks: { color: string };
    };
    expect(x.ticks.color).toBe('on-surface');
  });

  it('offers no tooltips without titles for the bars', () => {
    setUp(oneRound);

    expect(chart().config.options?.plugins?.tooltip?.enabled).toBeFalse();
  });

  it('titles a tooltip with the title of its bar', () => {
    setUp(oneRound, { tooltipTitles: ['one', 'two', 'three'] });

    const tooltip = chart().config.options?.plugins?.tooltip as {
      enabled: boolean;
      callbacks: { title: (items: { dataIndex: number }[]) => string };
    };
    expect(tooltip.enabled).toBeTrue();
    expect(tooltip.callbacks.title([{ dataIndex: 1 }])).toBe('two');
  });
});
