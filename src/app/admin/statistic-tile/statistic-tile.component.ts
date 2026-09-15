import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { TranslocoPipe } from '@jsverse/transloco';

/** Rendered instead of a number as long as the value has not arrived. */
export const VALUE_PLACEHOLDER = '–';

/**
 * A single big number with a label, used by the admin statistics summary. `label` and
 * `description` are i18n keys rather than literal text, the latter interpolated with
 * `descriptionParams`.
 */
@Component({
  selector: 'app-statistic-tile',
  templateUrl: './statistic-tile.component.html',
  styleUrls: ['./statistic-tile.component.scss'],
  imports: [CoreModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticTileComponent {
  readonly label = input.required<string>();
  readonly value = input<number>();
  readonly description = input<string>();
  readonly descriptionParams = input<Record<string, string | number>>({});

  protected readonly placeholder = VALUE_PLACEHOLDER;
}
