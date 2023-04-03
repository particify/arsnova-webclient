import { TestBed, inject } from '@angular/core/testing';

import { ApiConfigService } from './api-config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@app/core/services/util/notification.service';

describe('ApiConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiConfigService,
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
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [ApiConfigService],
    (service: ApiConfigService) => {
      expect(service).toBeTruthy();
    }
  ));
});
