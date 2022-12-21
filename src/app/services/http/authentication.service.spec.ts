import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockRouter,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockApiConfigService {}

class MockRoutingService {}

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
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
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [AuthenticationService],
    (service: AuthenticationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
