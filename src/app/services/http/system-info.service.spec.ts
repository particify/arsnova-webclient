import { TestBed, inject } from '@angular/core/testing';

import { SystemInfoService } from '@arsnova/app/services/http/system-info.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';

describe('SystemInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemInfoService,
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
    [SystemInfoService],
    (service: SystemInfoService) => {
      expect(service).toBeTruthy();
    }
  ));
});
