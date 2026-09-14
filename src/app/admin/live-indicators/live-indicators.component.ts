import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { UiConfig } from '@app/core/models/api-config';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import {
  ActiveRoomStatsGql,
  ActiveRoomStatsQueryVariables,
} from '@gql/generated/graphql';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, map, of, switchMap, timer } from 'rxjs';

const REFRESH_INTERVAL = 30000;

/**
 * Point-in-time gauges shown in the admin drawer. Both poll independently and render nothing at
 * all while their own value is unavailable, so one failing backend does not affect the other.
 */
@Component({
  selector: 'app-live-indicators',
  templateUrl: './live-indicators.component.html',
  styleUrls: ['./live-indicators.component.scss'],
  imports: [CoreModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LiveIndicatorsComponent {
  private readonly apiConfigService = inject(ApiConfigService);
  private readonly systemInfoService = inject(SystemInfoService);
  private readonly activeRoomStatsGql = inject(ActiveRoomStatsGql);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly connectedUserCount = toSignal(
    timer(0, REFRESH_INTERVAL).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() => this.systemInfoService.getConnectedUserCount())
    )
  );

  protected readonly activeRoomStats = toSignal(
    this.apiConfigService.getApiConfig$().pipe(
      map((config) => this.buildVariables(config.ui)),
      switchMap((variables) =>
        timer(0, REFRESH_INTERVAL).pipe(
          switchMap(() =>
            this.activeRoomStatsGql
              .fetch({
                variables: variables,
                fetchPolicy: 'no-cache',
                context: { silentError: true },
              })
              .pipe(
                /* Nullable field: an errored query nulls it rather than the whole payload. */
                map((result) => result.data?.adminActiveRoomStats),
                /* A background gauge must never raise a UI error - it would on every tick. */
                catchError(() => of(undefined))
              )
          )
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  /**
   * An unset threshold is left out of the variables entirely rather than defaulted here, so that
   * the server applies its own `room.activity.*` configuration. The response echoes back whatever
   * was actually used either way.
   */
  private buildVariables(ui: UiConfig): ActiveRoomStatsQueryVariables {
    const variables: ActiveRoomStatsQueryVariables = {};
    const activeRooms = ui.admin?.indicators?.activeRooms;
    if (activeRooms?.minMemberCount != null) {
      variables.minMemberCount = activeRooms.minMemberCount;
    }
    if (activeRooms?.windowMinutes != null) {
      variables.activityWindowMinutes = activeRooms.windowMinutes;
    }
    return variables;
  }
}
