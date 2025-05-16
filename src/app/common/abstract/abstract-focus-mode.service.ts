import { Injectable, OnDestroy, inject } from '@angular/core';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { HttpClient } from '@angular/common/http';
import { Message } from '@stomp/stompjs';
import { Room } from '@app/core/models/room';
import { EventService } from '@app/core/services/util/event.service';
import { BehaviorSubject, Subject, filter, map, takeUntil } from 'rxjs';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import { EntityChangedPayload } from '@app/core/models/events/entity-changed-payload';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

@Injectable()
export abstract class AbstractFocusModeService implements OnDestroy {
  protected wsConnector = inject(WsConnectorService);
  protected http = inject(HttpClient);
  protected eventService = inject(EventService);
  protected featureFlagService = inject(FeatureFlagService);

  destroyed$ = new Subject<void>();
  protected focusModeEnabled$ = new BehaviorSubject<boolean>(false);

  protected currentRoom?: Room;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected subscribeToRoomChanges() {
    this.eventService
      .on('EntityChanged')
      .pipe(
        takeUntil(this.destroyed$),
        map((changes) => changes as EntityChangedPayload<Room>),
        filter((changes) => changes.entityType === 'Room')
      )
      .subscribe((changes) => {
        const changedEvent = new EntityChanged(
          'Room',
          changes.entity,
          changes.changedProperties
        );
        if (changedEvent.hasPropertyChanged('focusModeEnabled')) {
          this.focusModeEnabled$.next(changes.entity.focusModeEnabled);
        }
      });
  }

  protected loadState() {
    if (this.currentRoom) {
      this.http
        .get<FocusEvent>(`api/room/${this.currentRoom.id}/focus-event`)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((state) => {
          this.handleState(state, true);
        });
    }
  }

  protected subscribeToState() {
    if (this.currentRoom) {
      this.wsConnector
        .getWatcher(`/topic/${this.currentRoom.id}.focus.state.stream`)
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
