import { TestBed, inject } from '@angular/core/testing';

import { TrackingService } from '@arsnova/app/services/util/tracking.service';
import {
  MockEventService,
  MockRouter,
  MockThemeService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ThemeService } from '@arsnova/theme/theme.service';
import { ConsentService } from '@arsnova/app/services/util/consent.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { Injectable } from '@angular/core';
import { GlobalStorageService } from './global-storage.service';

@Injectable()
class MockConsentService {
  consentGiven() {}
}

@Injectable()
class MockAuthenticationService {}

@Injectable()
class MockGlobalStorageService {}

describe('TrackingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TrackingService,
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: ConsentService,
          useClass: MockConsentService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
  });

  it('should be created', inject(
    [TrackingService],
    (service: TrackingService) => {
      expect(service).toBeTruthy();
    }
  ));
});
