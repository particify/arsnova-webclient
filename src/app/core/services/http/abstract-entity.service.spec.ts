import { inject, TestBed } from '@angular/core/testing';
import { AbstractEntityService } from './abstract-entity.service';
import { Injectable } from '@angular/core';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Cache, CachingService } from '@app/core/services/util/caching.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
class TestEntity {
  id!: string;
}

@Injectable()
class TestEntityService extends AbstractEntityService<TestEntity> {
  constructor() {
    super('Test', '/test');
  }
}

describe('AbstractEntityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestEntityService,
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
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
    [TestEntityService],
    (service: TestEntityService) => {
      expect(service).toBeTruthy();
    }
  ));
});
