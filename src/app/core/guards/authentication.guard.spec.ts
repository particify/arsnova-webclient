import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { RoomService } from '@app/core/services/http/room.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockNotificationService,
  MockRouter,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { RoutingService } from '@app/core/services/util/routing.service';
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
          provide: TranslocoService,
          useClass: MockTranslocoService,
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
