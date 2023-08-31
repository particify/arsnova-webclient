import { TestBed, inject } from '@angular/core/testing';

import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { of } from 'rxjs';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockAuthenticationService {
  getAuthenticationChanges() {
    return of(null);
  }
}

describe('RoomMembershipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoomMembershipService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [RoomMembershipService],
    (service: RoomMembershipService) => {
      expect(service).toBeTruthy();
    }
  ));
});
