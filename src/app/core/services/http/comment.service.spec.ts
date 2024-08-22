import { TestBed, inject } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
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

describe('CommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
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
    [CommentService],
    (service: CommentService) => {
      expect(service).toBeTruthy();
    }
  ));
});
