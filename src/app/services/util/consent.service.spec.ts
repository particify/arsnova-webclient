import { TestBed, inject } from '@angular/core/testing';

import { ConsentService } from '@arsnova/app/services/util/consent.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@arsnova/app/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
