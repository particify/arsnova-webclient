import { TestBed, inject } from '@angular/core/testing';

import { ContentAnswerService } from '@core/services/http/content-answer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { WsConnectorService } from '@core/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@core/services/util/caching.service';
import { Injectable } from '@angular/core';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

describe('ContentAnswerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentAnswerService,
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
    [ContentAnswerService],
    (service: ContentAnswerService) => {
      expect(service).toBeTruthy();
    }
  ));
});
