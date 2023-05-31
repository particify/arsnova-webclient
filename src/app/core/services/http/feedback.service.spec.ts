import { TestBed } from '@angular/core/testing';

import { FeedbackService } from '@app/core/services/http/feedback.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Injectable } from '@angular/core';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { Room } from '@app/core/models/room';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

@Injectable()
class MockWsFeedbackService {}

describe('FeedbackService', () => {
  let service: FeedbackService;
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
    service = TestBed.inject(FeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get correct sum of data array', () => {
    const data = [1, 2, 3, 4];
    const sum = service.getAnswerSum(data);
    expect(sum).toEqual(10);
  });

  it('should get correct bar data of data array and sum', () => {
    const data = [1, 2, 3, 4];
    const sum = service.getAnswerSum(data);
    const barData = service.getBarData(data, sum);
    expect(barData).toEqual([10, 20, 30, 40]);
  });

  it('should get correct default type if no extensions exist for room', () => {
    const room = new Room();
    const type = service.getType(room);
    expect(type).toEqual(LiveFeedbackType.FEEDBACK);
  });

  it('should get correct default type if room extensions exist but not for feedback', () => {
    const room = new Room();
    room.extensions = {};
    const type = service.getType(room);
    expect(type).toEqual(LiveFeedbackType.FEEDBACK);
  });

  it('should get correct type from room extensions if set to feedback', () => {
    const room = new Room();
    room.extensions = {
      feedback: {
        type: LiveFeedbackType.FEEDBACK,
      },
    };
    const type = service.getType(room);
    expect(type).toEqual(LiveFeedbackType.FEEDBACK);
  });

  it('should get correct type from room extensions if set to survey', () => {
    const room = new Room();
    room.extensions = {
      feedback: {
        type: LiveFeedbackType.SURVEY,
      },
    };
    const type = service.getType(room);
    expect(type).toEqual(LiveFeedbackType.SURVEY);
  });
});
