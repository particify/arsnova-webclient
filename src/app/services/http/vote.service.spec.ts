import { TestBed, inject } from '@angular/core/testing';

import { VoteService } from '@arsnova/app/services/http/vote.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';

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

  it('should be created', inject([VoteService], (service: VoteService) => {
    expect(service).toBeTruthy();
  }));
});
