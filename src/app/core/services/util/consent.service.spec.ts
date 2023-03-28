import { TestBed, inject } from '@angular/core/testing';

import { ConsentService } from '@core/services/util/consent.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@core/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/util/notification.service';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('ConsentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientTestingModule],
      providers: [
        ConsentService,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
  });

  it('should be created', inject(
    [ConsentService],
    (service: ConsentService) => {
      expect(service).toBeTruthy();
    }
  ));
});
