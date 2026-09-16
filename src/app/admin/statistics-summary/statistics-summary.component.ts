import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { StatisticTileComponent } from '@app/admin/statistic-tile/statistic-tile.component';
import { CoreModule } from '@app/core/core.module';
import { UiConfig } from '@app/core/models/api-config';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { AdminRoomActivityStatsGql } from '@gql/generated/graphql';
import { TranslocoPipe } from '@jsverse/transloco';
import dayjs from 'dayjs';
import { catchError, map, of, switchMap } from 'rxjs';

/** Window length a deployment gets without an `ui.admin.statistics.summaryRangeDays` setting. */
const SUMMARY_RANGE_DAYS = 90;

/**
 * Resolves the configured window length. Anything but a whole number of days above zero falls
 * back to {@link SUMMARY_RANGE_DAYS}.
 */
function resolveRangeDays(ui: UiConfig | undefined): number {
  const days = ui?.['admin']?.statistics?.summaryRangeDays;
  return Number.isInteger(days) && days > 0 ? days : SUMMARY_RANGE_DAYS;
}

/**
 * Activity in a recent period, as opposed to the lifetime totals of the "More data" tabs below it.
 * Deployments configure the length of that period, but not its end: the participant count reads
 * the single mutable `Membership.lastActivityAt`, so the window can only ever end now.
 * The room-derived counts sit on an immutable `created_at` and could answer any range.
 */
@Component({
  selector: 'app-statistics-summary',
  templateUrl: './statistics-summary.component.html',
  styleUrls: ['../admin-styles.scss', './statistics-summary.component.scss'],
  imports: [CoreModule, TranslocoPipe, StatisticTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsSummaryComponent {
  private readonly apiConfigService = inject(ApiConfigService);
  private readonly adminRoomActivityStatsGql = inject(
    AdminRoomActivityStatsGql
  );

  /* The configuration is loaded via HTTP and cached for an hour, so the initial value is what
   * most page loads render. */
  private readonly rangeDays = toSignal(
    this.apiConfigService
      .getApiConfig$()
      .pipe(map((config) => resolveRangeDays(config.ui))),
    { initialValue: SUMMARY_RANGE_DAYS }
  );

  /** Interpolates the period into the heading and into every tile description. */
  protected readonly rangeParams = computed(() => ({
    days: this.rangeDays(),
  }));

  private readonly range = computed(() => {
    const to = dayjs();
    return {
      from: to.subtract(this.rangeDays(), 'day').toISOString(),
      to: to.toISOString(),
    };
  });

  protected readonly activityStats = toSignal(
    toObservable(this.range).pipe(
      switchMap((range) =>
        this.adminRoomActivityStatsGql.fetch({ variables: range }).pipe(
          map((result) => result.data?.adminRoomActivityStats),
          /* A failed request must not blank the view - the tiles keep their placeholders. */
          catchError(() => of(undefined))
        )
      )
    )
  );
}
