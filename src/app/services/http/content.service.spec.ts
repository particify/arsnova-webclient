import { TestBed, inject } from '@angular/core/testing';

import { ContentService } from '@arsnova/app/services/http/content.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockRouter,
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
import { Router } from '@angular/router';
import { DialogService } from '@arsnova/app/services/util/dialog.service';

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
