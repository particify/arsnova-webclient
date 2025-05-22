import { FeedbackService } from '@app/core/services/http/feedback.service';
import { MockTranslocoService } from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { Injectable } from '@angular/core';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { Room } from '@app/core/models/room';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { configureTestModule } from '@testing/test.setup';

@Injectable()
class MockWsFeedbackService {}

describe('FeedbackService', () => {
  let service: FeedbackService;
  beforeEach(() => {
    const testBed = configureTestModule(
      [],
      [
        FeedbackService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
        {
          provide: WsFeedbackService,
          useClass: MockWsFeedbackService,
        },
      ]
    );
    service = testBed.inject(FeedbackService);
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
