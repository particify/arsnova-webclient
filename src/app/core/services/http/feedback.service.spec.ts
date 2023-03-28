import { TestBed, inject } from '@angular/core/testing';

import { FeedbackService } from '@core/services/http/feedback.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { Injectable } from '@angular/core';
import { WsFeedbackService } from '@core/services/websockets/ws-feedback.service';

@Injectable()
class MockWsFeedbackService {}

describe('FeedbackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FeedbackService,
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
          provide: WsFeedbackService,
          useClass: MockWsFeedbackService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject(
    [FeedbackService],
    (service: FeedbackService) => {
      expect(service).toBeTruthy();
    }
  ));
});
