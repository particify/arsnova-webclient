import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { RoomMembershipService } from '@core/services/room-membership.service';
import { RoomService } from '@core/services/http/room.service';
import { NotificationService } from '@core/services/util/notification.service';
import {
  MockNotificationService,
  MockRouter,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { RoutingService } from '@core/services/util/routing.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
class MockAuthenticationService {}

@Injectable()
class MockRoomMembershipService {}

@Injectable()
class MockRoomService {}

@Injectable()
class MockRoutingService {}
describe('AuthenticationGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockRoomMembershipService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
      ],
    });
  });

  it('should be created', inject(
    [AuthenticationGuard],
    (guard: AuthenticationGuard) => {
      expect(guard).toBeTruthy();
    }
  ));
});
