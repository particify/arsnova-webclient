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
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

@Injectable()
export abstract class AbstractFocusModeService implements OnDestroy {
  protected wsConnector = inject(WsConnectorService);
  protected http = inject(HttpClient);
  protected featureFlagService = inject(FeatureFlagService);
  protected roomService = inject(RoomService);
  protected roomSettingsService = inject(RoomSettingsService);

  destroyed$ = new Subject<void>();

  protected roomId?: string;
  protected roomId$ = this.roomService.getCurrentRoomStream().pipe(
    takeUntil(this.destroyed$),
    filter((r) => !!r),
    map((r) => r.id),
    tap((id) => (this.roomId = id))
  );

  protected focusModeEnabled = false;
  protected focusModeEnabled$ = this.roomId$.pipe(
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
    tap((enabled) => (this.focusModeEnabled = enabled))
  );

  constructor() {
    this.loadState();
    this.subscribeToState();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected loadState() {
    this.roomId$
      .pipe(
        switchMap((id) =>
          this.http.get<FocusEvent>(`api/room/${id}/focus-event`)
        )
      )
      .subscribe((state) => {
        this.handleState(state, true);
      });
  }

  protected subscribeToState() {
    this.roomId$
      .pipe(
        switchMap((id) =>
          this.wsConnector.getWatcher(`/topic/${id}.focus.state.stream`)
        )
      )
      .subscribe((msg) => {
        const state = JSON.parse(msg.body);
        this.handleState(state);
      });
  }

  protected abstract handleState(state?: FocusEvent, initial?: boolean): void;

  getFocusModeEnabled(): Observable<boolean> {
    return this.focusModeEnabled$;
  }
}
