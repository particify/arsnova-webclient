import { Injectable } from '@angular/core';
import { IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModeratorDataChanged, PublicDataChanged } from '../../models/events/data-changed';
import { EntityChangeNotification } from '../../models/events/entity-change-notification';
import { Room } from '../../models/room';
import { UserRole } from '../../models/user-roles.enum';
import { RoomService } from '../http/room.service';
import { RoomMembershipService } from '../room-membership.service';
import { EventService } from '../util/event.service';
import { WsConnectorService } from './ws-connector.service';

@Injectable()
export class WsRoomEventDispatcher {
  private roomChanged$ = new Subject<void>();

  constructor(
    private wsConnector: WsConnectorService,
    private eventService: EventService,
    private roomMembershipService: RoomMembershipService,
    private roomService: RoomService
  ) {
  }

  init() {
    this.roomService.getCurrentRoomStream().subscribe(r => this.handleRoomChange(r));
  }

  private handleRoomChange(room?: Room) {
    this.roomChanged$.next();
    if (room) {
      const role$ = this.roomMembershipService.getPrimaryRoleByRoom(room.shortId);
      this.registerChangesMetaListener(room);
      role$.subscribe(role => this.registerDataChangeListener(room, role));
      ;
    }
  }

  private registerChangesMetaListener(room: Room) {
    this.wsConnector.getWatcher(`/topic/${room.id}.changes-meta.stream`)
        .pipe(takeUntil(this.roomChanged$)).subscribe(msg => {
      this.dispatchEntityChangeNotificationEvent(msg, room);
    });
  }

  private registerDataChangeListener(room: Room, role: UserRole) {
    this.wsConnector.getWatcher(`/topic/${room.id}.changes.stream`)
    .pipe(takeUntil(this.roomChanged$)).subscribe(msg => {
      this.dispatchDataChangeEvents(msg, room, false);
    });
    if ([UserRole.CREATOR, UserRole.EDITING_MODERATOR, UserRole.EXECUTIVE_MODERATOR].includes(role)) {
      this.wsConnector.getWatcher(`/topic/${room.id}.moderator.changes.stream`)
          .pipe(takeUntil(this.roomChanged$)).subscribe(msg => {
        this.dispatchDataChangeEvents(msg, room, true)
      });
    }
  }

  private dispatchEntityChangeNotificationEvent(msg: IMessage, room: Room) {
    const msgEvent = JSON.parse(msg.body);
    const entityChangeNotification = new EntityChangeNotification(
        msgEvent.changeType,
        msgEvent.entityType,
        msgEvent.entityId,
        room.id);
    this.eventService.broadcast(entityChangeNotification.type, entityChangeNotification);
  }

  private dispatchDataChangeEvents(msg: IMessage, room: Room, moderatorRole: boolean) {
    const dataType = msg.headers['__TypeId__'].split('.').slice(-1)[0];
    const data = JSON.parse(msg.body);
    const event = moderatorRole
        ? new ModeratorDataChanged(dataType, room.id, data)
        : new PublicDataChanged(dataType, room.id, data);
    this.eventService.broadcast(event.type, event);
  }
}
