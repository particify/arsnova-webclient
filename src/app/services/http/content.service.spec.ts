import { TestBed, inject } from '@angular/core/testing';

import { ContentService } from '@arsnova/app/services/http/content.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MockEventService, MockNotificationService, MockTranslateService } from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { WsConnectorService } from '@arsnova/app/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@arsnova/app/services/util/caching.service';
import { Injectable } from '@angular/core';

@Injectable()
class MockWsConnectorService {
}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

describe('ContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentService,
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService
        },
        {
          provide: CachingService,
          useClass: MockCachingService
        }
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should be created', inject([ContentService], (service: ContentService) => {
    expect(service).toBeTruthy();
  }));
});
