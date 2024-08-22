import { TestBed, inject } from '@angular/core/testing';

import { AdminService } from './admin.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { UserService } from '@app/core/services/http/user.service';

export class MockUserService {}

describe('AdminService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminService,
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
        {
          provide: UserService,
          useClass: MockUserService,
        },
      ],
      imports: [HttpClientTestingModule],
    });
  });

  it('should be created', inject([AdminService], (service: AdminService) => {
    expect(service).toBeTruthy();
  }));
});
