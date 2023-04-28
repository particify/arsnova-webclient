import { TestBed, inject } from '@angular/core/testing';

import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@app/core/services/util/caching.service';
import { Injectable } from '@angular/core';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

describe('RoomStatsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoomStatsService,
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
          provide: CachingService,
          useClass: MockCachingService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [RoomStatsService],
    (service: RoomStatsService) => {
      expect(service).toBeTruthy();
    }
  ));
});
