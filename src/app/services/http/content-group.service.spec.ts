import { TestBed, inject } from '@angular/core/testing';

import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { WsConnectorService } from '@arsnova/app/services/websockets/ws-connector.service';
import {
  Cache,
  CachingService,
} from '@arsnova/app/services/util/caching.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {}
}

@Injectable()
class MockFeedbackService {}

@Injectable()
class MockRoomStatsService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

describe('ContentGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentGroupService,
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
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
        },
        {
          provide: CachingService,
          useClass: MockCachingService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [ContentGroupService],
    (service: ContentGroupService) => {
      expect(service).toBeTruthy();
    }
  ));
});
