import { TestBed, inject } from '@angular/core/testing';

import { AdminService } from './admin.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { UserService } from '@core/services/http/user.service';

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
          provide: TranslateService,
          useClass: MockTranslateService,
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
