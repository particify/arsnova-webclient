import { TestBed, inject } from '@angular/core/testing';

import { ModeratorService } from '@core/services/http/moderator.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';

describe('ModeratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModeratorService,
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
    [ModeratorService],
    (service: ModeratorService) => {
      expect(service).toBeTruthy();
    }
  ));
});
