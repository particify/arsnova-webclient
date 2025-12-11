import { Injectable, inject } from '@angular/core';
import { IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import {
  ModeratorDataChanged,
  PublicDataChanged,
} from '@app/core/models/events/data-changed';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { RoomMembershipByIdGql, RoomRole } from '@gql/generated/graphql';
import { RoomService } from '@app/core/services/http/room.service';
import { EventService } from '@app/core/services/util/event.service';
import { WsConnectorService } from './ws-connector.service';

@Injectable()
export class WsRoomEventDispatcherService {
  private wsConnector = inject(WsConnectorService);
  private eventService = inject(EventService);
  private roomService = inject(RoomService);
  private roomMembershipByIdGql = inject(RoomMembershipByIdGql);

  private roomChanged$ = new Subject<void>();

  init() {
    this.roomService
      .getCurrentRoomIdStream()
      .subscribe((r) => this.handleRoomChange(r));
  }

  private handleRoomChange(roomId?: string) {
    this.roomChanged$.next();
    if (roomId) {
      const role$ = this.roomMembershipByIdGql
        .fetch({ variables: { roomId: roomId } })
        .pipe(
          map((r) => r.data),
          filter((data) => !!data),
          map((data) => data.roomMembershipById?.role ?? RoomRole.None)
        );
      this.registerChangesMetaListener(roomId);
      role$.subscribe((role) => this.registerDataChangeListener(roomId, role));
    }
  }

  private registerChangesMetaListener(roomId: string) {
    this.wsConnector
      .getWatcher(`/topic/${roomId}.changes-meta.stream`)
      .pipe(takeUntil(this.roomChanged$))
      .subscribe((msg) => {
        this.dispatchEntityChangeNotificationEvent(msg, roomId);
      });
  }

  private registerDataChangeListener(roomId: string, role: RoomRole) {
    this.wsConnector
      .getWatcher(`/topic/${roomId}.changes.stream`)
      .pipe(takeUntil(this.roomChanged$))
      .subscribe((msg) => {
        this.dispatchDataChangeEvents(msg, roomId, false);
      });
    if ([RoomRole.Owner, RoomRole.Editor, RoomRole.Moderator].includes(role)) {
      this.wsConnector
        .getWatcher(`/topic/${roomId}.moderator.changes.stream`)
        .pipe(takeUntil(this.roomChanged$))
        .subscribe((msg) => {
          this.dispatchDataChangeEvents(msg, roomId, true);
        });
    }
  }

  private dispatchEntityChangeNotificationEvent(msg: IMessage, roomId: string) {
    const msgEvent = JSON.parse(msg.body);
    const entityChangeNotification = new EntityChangeNotification(
      msgEvent.changeType,
      msgEvent.entityType,
      msgEvent.entityId,
      roomId
    );
    this.eventService.broadcast(
      entityChangeNotification.type,
      entityChangeNotification
    );
  }

  private dispatchDataChangeEvents(
    msg: IMessage,
    roomId: string,
    moderatorRole: boolean
  ) {
    const dataType = msg.headers['__TypeId__'].split('.').slice(-1)[0];
    const data = JSON.parse(msg.body);
    const event = moderatorRole
      ? new ModeratorDataChanged(dataType, roomId, data)
      : new PublicDataChanged(dataType, roomId, data);
    this.eventService.broadcast(event.type, event);
  }
}
