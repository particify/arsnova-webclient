import { Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  DataLabelMode,
  dataLabel,
} from '@app/standalone/content-results/visualization/data-label';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

export interface BarListItem {
  label: string;
  labelRendered?: string | null;
  value: number;
}

/** Keeps a bar visible however small its value is next to the largest one. */
const MIN_BAR_PERCENT = 2;

/**
 * Every value sits just past its own bar's tip, so the bars share out only this
 * much of the row and leave the rest for the longest of them to be labelled in.
 * Scaling them all by the one factor keeps their proportions exact.
 */
const MAX_BAR_PERCENT = 90;

@Component({
  selector: 'app-bar-list',
  imports: [RenderedTextComponent],
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.scss',
})
export class BarListComponent {
  private readonly themeService = inject(ThemeService);

  readonly items = input.required<BarListItem[]>();
  readonly dataLabelMode = input<DataLabelMode>('absolute');

  private readonly maxValue = computed(() =>
    this.items().reduce((max, item) => Math.max(max, item.value), 0)
  );

  /** A percentage is a share of every value shown, as a chart's would be. */
  private readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.value, 0)
  );

  readonly bars = computed(() => {
    const colors = this.themeService.getBarColors();
    const maxValue = this.maxValue();
    const total = this.total();
    const mode = this.dataLabelMode();
    return this.items().map((item, index) => ({
      label: item.label,
      labelRendered: item.labelRendered ?? undefined,
      text: dataLabel(item.value, total, mode),
      color: colors.length ? colors[index % colors.length] : undefined,
      widthPercent: barWidth(item.value, maxValue),
    }));
  });
}

/** Relative to the largest value, which is the scaling a chart would apply. */
function barWidth(value: number, maxValue: number): number {
  if (value <= 0 || maxValue <= 0) {
    return 0;
  }
  return Math.max(MIN_BAR_PERCENT, (value / maxValue) * MAX_BAR_PERCENT);
}
