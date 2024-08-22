import { TestBed, inject } from '@angular/core/testing';

import { ModeratorService } from '@app/core/services/http/moderator.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';

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

  it('should be created', inject(
    [ModeratorService],
    (service: ModeratorService) => {
      expect(service).toBeTruthy();
    }
  ));
});
