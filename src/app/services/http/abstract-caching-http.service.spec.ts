import { inject, TestBed } from '@angular/core/testing';

import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WsConnectorService } from '@arsnova/app/services/websockets/ws-connector.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { CachingService } from '@arsnova/app/services/util/caching.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {}
}

@Injectable()
class TestCachingHttpService extends AbstractCachingHttpService<object> {
  constructor(
    httpClient: HttpClient,
    protected wsConnector: WsConnectorService,
    eventService: EventService,
    translateService: TranslateService,
    notificationService: NotificationService,
    protected cachingService: CachingService
  ) {
    super(
      '/test',
      httpClient,
      wsConnector,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }
}

describe('AbstractCachingHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestCachingHttpService,
        {
          provide: EventService,
          useClass: MockEventService,
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
    [TestCachingHttpService],
    (service: TestCachingHttpService) => {
      expect(service).toBeTruthy();
    }
  ));
});
