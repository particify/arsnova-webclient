import { inject, TestBed } from '@angular/core/testing';

import { WsRoomEventDispatcherService } from '@app/core/services/websockets/ws-room-event-dispatcher.service';
import { Injectable } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { EventService } from '@app/core/services/util/event.service';
import { MockEventService } from '@testing/test-helpers';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { RoomService } from '@app/core/services/http/room.service';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockRoomMembershipService {}

@Injectable()
class MockRoomService {}

describe('WsRoomEventDispatcherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsRoomEventDispatcherService,
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockRoomMembershipService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
      ],
    });
  });

  it('should be created', inject(
    [WsRoomEventDispatcherService],
    (service: WsRoomEventDispatcherService) => {
      expect(service).toBeTruthy();
    }
  ));
});
