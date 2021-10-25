import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { RoomMembershipService } from '@arsnova/app/services/room-membership.service';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { MockNotificationService, MockRouter, MockTranslateService } from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
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
          useClass: MockAuthenticationService
        },
        {
          provide: RoomMembershipService,
          useClass: MockRoomMembershipService
        },
        {
          provide: RoomService,
          useClass: MockRoomService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    });
  });

  it('should be created', inject([AuthenticationGuard], (guard: AuthenticationGuard) => {
    expect(guard).toBeTruthy();
  }));
});
