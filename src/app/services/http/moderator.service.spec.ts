import { TestBed, inject } from '@angular/core/testing';

import { ModeratorService } from '@arsnova/app/services/http/moderator.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MockEventService, MockNotificationService, MockTranslateService } from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { Injectable } from '@angular/core';

@Injectable()
class MockWsModerator {
}

describe('ModeratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModeratorService,
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        }
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should be created', inject([ModeratorService], (service: ModeratorService) => {
    expect(service).toBeTruthy();
  }));
});
