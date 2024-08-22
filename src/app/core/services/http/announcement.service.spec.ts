import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';

import { AnnouncementService } from './announcement.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnnouncementService,
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
    service = TestBed.inject(AnnouncementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
