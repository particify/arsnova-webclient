import { Injectable, OnDestroy, inject } from '@angular/core';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { HttpClient } from '@angular/common/http';
import { Message } from '@stomp/stompjs';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

@Injectable()
export abstract class AbstractFocusModeService implements OnDestroy {
  protected wsConnector = inject(WsConnectorService);
  protected http = inject(HttpClient);
  protected featureFlagService = inject(FeatureFlagService);
  protected roomSettingsService = inject(RoomSettingsService);

  destroyed$ = new Subject<void>();
  protected focusModeEnabled$ = new BehaviorSubject<boolean>(false);
  protected focusModeEnabled = false;

  protected roomId?: string;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected subscribeToRoomChanges() {
    if (!this.roomId) {
      return;
    }
    const roomId = this.roomId;
    this.roomSettingsService
      .getByRoomId(roomId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings) => {
        this.focusModeEnabled = settings.focusModeEnabled;
        this.roomSettingsService
          .getRoomSettingsStream(roomId, settings.id)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((settings) => {
            if (settings.focusModeEnabled !== undefined) {
              this.focusModeEnabled$.next(settings.focusModeEnabled);
            }
          });
      });
  }

  protected loadState() {
    if (this.roomId) {
      this.http
        .get<FocusEvent>(`api/room/${this.roomId}/focus-event`)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((state) => {
          this.handleState(state, true);
        });
    }
  }

  protected subscribeToState() {
    if (this.roomId) {
      this.wsConnector
        .getWatcher(`/topic/${this.roomId}.focus.state.stream`)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((msg: Message) => {
          const state = JSON.parse(msg.body);
          this.handleState(state);
        });
    }
  }

  protected abstract handleState(state?: FocusEvent, initial?: boolean): void;

  getFocusModeEnabled() {
    return this.focusModeEnabled$;
  }
}
