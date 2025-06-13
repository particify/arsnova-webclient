import { FeedbackService } from '@app/core/services/http/feedback.service';
import { MockTranslocoService } from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { Injectable } from '@angular/core';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
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
});
