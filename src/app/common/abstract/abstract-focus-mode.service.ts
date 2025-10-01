import { Injectable, OnDestroy, inject } from '@angular/core';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { HttpClient } from '@angular/common/http';
import {
  concat,
  filter,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RxStompState } from '@stomp/rx-stomp';

@Injectable()
export abstract class AbstractFocusModeService implements OnDestroy {
  protected wsConnector = inject(WsConnectorService);
  protected http = inject(HttpClient);
  protected featureFlagService = inject(FeatureFlagService);
  protected roomService = inject(RoomService);
  protected roomSettingsService = inject(RoomSettingsService);

  destroyed$ = new Subject<void>();

  private readonly wsReconnect$ = this.wsConnector.getConnectionState().pipe(
    takeUntil(this.destroyed$),
    filter((state) => [RxStompState.OPEN, RxStompState.CLOSED].includes(state)),
    startWith(undefined),
    pairwise(),
    filter(([prev, cur]) => cur === RxStompState.OPEN && cur !== prev),
    map(() => {
      // We are not interested in the actual value.
      return;
    })
  );

  protected readonly roomId$ = this.roomService.getCurrentRoomStream().pipe(
    takeUntil(this.destroyed$),
    filter((r) => !!r),
    map((r) => r.id),
    shareReplay()
  );
  protected readonly roomId = toSignal(this.roomId$);

  protected readonly focusModeEnabled$ = this.roomId$.pipe(
    switchMap((roomId) =>
      this.roomSettingsService
        .getByRoomId(roomId)
        .pipe(
          switchMap((s) =>
            concat(
              of(s),
              this.roomSettingsService.getRoomSettingsStream(roomId, s.id)
            )
          )
        )
    ),
    map((s) => s.focusModeEnabled),
    filter((e) => e !== undefined),
    shareReplay()
  );
  protected readonly focusModeEnabled = toSignal(this.focusModeEnabled$);

  /** Helper Observable for state to enable it conditionally and trigger reloads. */
  private readonly reloadState$ = this.focusModeEnabled$.pipe(
    switchMap((enabled) => (enabled ? this.wsReconnect$ : of()))
  );
  /** Emits focus mode state initially and after changes if focus mode is enabled. Reemits state after WebSocket reconnects. */
  protected readonly state$ = this.reloadState$.pipe(
    switchMap(() =>
      this.roomId$.pipe(
        switchMap((roomId) =>
          this.http
            .get<FocusEvent>(`api/room/${roomId}/focus-event`)
            .pipe(
              switchMap((e) =>
                concat(
                  of(e),
                  this.wsConnector
                    .getWatcher(`/topic/${roomId}.focus.state.stream`)
                    .pipe(map((msg) => JSON.parse(msg.body) as FocusEvent))
                )
              )
            )
        ),
        shareReplay()
      )
    )
  );

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getFocusModeEnabled(): Observable<boolean> {
    return this.focusModeEnabled$;
  }
}
