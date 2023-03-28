import { TestBed, inject } from '@angular/core/testing';

import { RoomService } from '@core/services/http/room.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { WsConnectorService } from '@core/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@core/services/util/caching.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { FeedbackService } from '@core/services/http/feedback.service';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {}
}

@Injectable()
class MockFeedbackService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

describe('RoomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoomService,
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
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: FeedbackService,
          useClass: MockFeedbackService,
        },
        {
          provide: CachingService,
          useClass: MockCachingService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject([RoomService], (service: RoomService) => {
    expect(service).toBeTruthy();
  }));
});
