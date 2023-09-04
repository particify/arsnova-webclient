import { TestBed, inject } from '@angular/core/testing';

import { TrackingService } from '@app/core/services/util/tracking.service';
import {
  MockEventService,
  MockRouter,
  MockThemeService,
  MockTranslateService,
} from '@testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ConsentService } from '@app/core/services/util/consent.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
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
        Window,
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
        {
          provide: Window,
          useValue: Window,
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
