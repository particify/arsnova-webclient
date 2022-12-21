import { TestBed, inject } from '@angular/core/testing';

import { RoomMembershipService } from '@arsnova/app/services/room-membership.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { WsConnectorService } from '@arsnova/app/services/websockets/ws-connector.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
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
          provide: TranslateService,
          useClass: MockTranslateService,
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
