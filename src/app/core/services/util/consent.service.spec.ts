import { TestBed, inject } from '@angular/core/testing';

import { ConsentService } from '@app/core/services/util/consent.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
  MockTranslocoService,
} from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
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
          provide: TranslocoService,
          useClass: MockTranslocoService,
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
