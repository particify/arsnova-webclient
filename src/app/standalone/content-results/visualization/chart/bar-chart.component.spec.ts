import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { configureTestModule } from '@testing/test.setup';
import { Chart } from 'chart.js';
import { BehaviorSubject } from 'rxjs';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
  let fixture: ComponentFixture<BarChartComponent>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let theme$: BehaviorSubject<Theme>;
  let chart: Chart;

  beforeEach(() => {
    theme$ = new BehaviorSubject<Theme>(Theme.LIGHT);
    themeService = jasmine.createSpyObj('ThemeService', [
      'getColor',
      'getCurrentTheme$',
    ]);
    themeService.getCurrentTheme$.and.returnValue(theme$);
    themeService.getColor.and.callFake((name) =>
      theme$.value === Theme.LIGHT ? `light-${name}` : `dark-${name}`
    );
    configureTestModule(
      [BarChartComponent],
      [{ provide: ThemeService, useValue: themeService }]
    ).compileComponents();
    fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('data', {
      labels: ['A', 'B'],
      datasets: [{ values: [1, 2], colors: ['red', 'blue'] }],
    });
    fixture.detectChanges();
    chart = Chart.getChart(fixture.nativeElement.querySelector('canvas'))!;
    expect(chart).toBeDefined();
    spyOn(chart, 'update').and.callThrough();
  });

  afterEach(() => fixture.destroy());

  it('applies a changed option to the chart', () => {
    expect(chart.options.plugins?.legend?.display).toBeFalse();

    fixture.componentRef.setInput('showLegend', true);
    fixture.detectChanges();

    expect(chart.options.plugins?.legend?.display).toBeTrue();
    expect(chart.update).toHaveBeenCalled();
  });

  it('keeps the bars when the data label mode changes', async () => {
    // Chart.js lays the bars out once the canvas is attached.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const bar = chart.getDatasetMeta(0).data[0];
    expect(bar).toBeDefined();

    fixture.componentRef.setInput('dataLabelMode', 'percent');
    fixture.detectChanges();

    expect(chart.update).toHaveBeenCalled();
    expect(chart.getDatasetMeta(0).data[0]).toBe(bar);
  });

  it('recolours the chart when the theme changes', () => {
    expect(chart.options.plugins?.datalabels?.color).toBe('light-on-surface');

    theme$.next(Theme.DARK);
    fixture.detectChanges();

    expect(chart.options.plugins?.datalabels?.color).toBe('dark-on-surface');
  });
});
