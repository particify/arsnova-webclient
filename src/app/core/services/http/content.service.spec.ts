import { TestBed, inject } from '@angular/core/testing';

import { ContentService } from '@core/services/http/content.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockRouter,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { WsConnectorService } from '@core/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@core/services/util/caching.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@core/services/util/dialog.service';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

@Injectable()
class MockDialogService {}

describe('ContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentService,
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
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [ContentService],
    (service: ContentService) => {
      expect(service).toBeTruthy();
    }
  ));
});
