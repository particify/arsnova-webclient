import { TestBed, inject } from '@angular/core/testing';

import { VoteService } from '@app/core/services/http/vote.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';

describe('VoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VoteService,
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
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject([VoteService], (service: VoteService) => {
    expect(service).toBeTruthy();
  }));
});
