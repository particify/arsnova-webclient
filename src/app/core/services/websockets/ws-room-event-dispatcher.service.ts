import { Injectable, inject } from '@angular/core';
import { IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  ModeratorDataChanged,
  PublicDataChanged,
} from '@app/core/models/events/data-changed';
import { EntityChangeNotification } from '@app/core/models/events/entity-change-notification';
import { Room } from '@app/core/models/room';
import { RoomMembershipByShortIdGql, RoomRole } from '@gql/generated/graphql';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { EventService } from '@app/core/services/util/event.service';
import { WsConnectorService } from './ws-connector.service';
import { environment } from '@environments/environment';

@Injectable()
export class WsRoomEventDispatcherService {
  private wsConnector = inject(WsConnectorService);
  private eventService = inject(EventService);
  private roomMembershipService = inject(RoomMembershipService);
  private roomService = inject(RoomService);
  private roomMembershipByShortIdGql = inject(RoomMembershipByShortIdGql);

  private roomChanged$ = new Subject<void>();

  init() {
    this.roomService
      .getCurrentRoomStream()
      .subscribe((r) => this.handleRoomChange(r));
  }

  private handleRoomChange(room?: Room) {
    this.roomChanged$.next();
    if (room) {
      const role$ = environment.graphql
        ? this.roomMembershipByShortIdGql
            .fetch({ shortId: room.shortId })
            .pipe(
              map((r) => r.data.roomMembershipByShortId?.role ?? RoomRole.None)
            )
        : this.roomMembershipService.getPrimaryRoleByRoom(room.shortId);
      this.registerChangesMetaListener(room);
      role$.subscribe((role) => this.registerDataChangeListener(room, role));
    }
  }

  private registerChangesMetaListener(room: Room) {
    this.wsConnector
      .getWatcher(`/topic/${room.id}.changes-meta.stream`)
      .pipe(takeUntil(this.roomChanged$))
      .subscribe((msg) => {
        this.dispatchEntityChangeNotificationEvent(msg, room);
      });
  }

  private registerDataChangeListener(room: Room, role: RoomRole) {
    this.wsConnector
      .getWatcher(`/topic/${room.id}.changes.stream`)
      .pipe(takeUntil(this.roomChanged$))
      .subscribe((msg) => {
        this.dispatchDataChangeEvents(msg, room, false);
      });
    if ([RoomRole.Owner, RoomRole.Editor, RoomRole.Moderator].includes(role)) {
      this.wsConnector
        .getWatcher(`/topic/${room.id}.moderator.changes.stream`)
        .pipe(takeUntil(this.roomChanged$))
        .subscribe((msg) => {
          this.dispatchDataChangeEvents(msg, room, true);
        });
    }
  }

  private dispatchEntityChangeNotificationEvent(msg: IMessage, room: Room) {
    const msgEvent = JSON.parse(msg.body);
    const entityChangeNotification = new EntityChangeNotification(
      msgEvent.changeType,
      msgEvent.entityType,
      msgEvent.entityId,
      room.id
    );
    this.eventService.broadcast(
      entityChangeNotification.type,
      entityChangeNotification
    );
  }

  private dispatchDataChangeEvents(
    msg: IMessage,
    room: Room,
    moderatorRole: boolean
  ) {
    const dataType = msg.headers['__TypeId__'].split('.').slice(-1)[0];
    const data = JSON.parse(msg.body);
    const event = moderatorRole
      ? new ModeratorDataChanged(dataType, room.id, data)
      : new PublicDataChanged(dataType, room.id, data);
    this.eventService.broadcast(event.type, event);
  }
}
