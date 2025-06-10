import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  STORAGE_CONFIG,
  STORAGECONFIG_PROVIDER_TOKEN,
} from '@app/core/services/util/global-storage.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { of } from 'rxjs';
import { ActivatedRouteStub } from './test-helpers';
import { ActivatedRoute } from '@angular/router';

export function configureTestModule(
  extraImports: any[] = [],
  extraProviders: Provider[] = []
): TestBed {
  const hotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);
  const trackingService = jasmine.createSpyObj('TrackingService', [
    'init',
    'addEvent',
  ]);
  const apiConfigService = jasmine.createSpyObj(ApiConfigService, [
    'getApiConfig$',
  ]);
  apiConfigService.getApiConfig$.and.returnValue(
    of({
      ui: {},
    })
  );
  const authenticationService = jasmine.createSpyObj('AuthenticationService', [
    'getAuthenticationChanges',
    'logout',
    'hasAdminRole',
  ]);
  authenticationService.getAuthenticationChanges.and.returnValue(
    of({ loginId: 'test@test.de' })
  );
  authenticationService.hasAdminRole.and.returnValue(false);
  const activatedRoute = new ActivatedRouteStub();

  return TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      TrackInteractionDirective,
      ...extraImports,
    ],
    providers: [
      {
        provide: HotkeyService,
        useValue: hotkeyService,
      },
      {
        provide: TrackingService,
        useValue: trackingService,
      },
      {
        provide: ENVIRONMENT,
        useValue: { features: [] },
      },
      {
        provide: ApiConfigService,
        useValue: apiConfigService,
      },
      {
        provide: AuthenticationService,
        useValue: authenticationService,
      },
      {
        provide: STORAGECONFIG_PROVIDER_TOKEN,
        useValue: STORAGE_CONFIG,
      },
      {
        provide: ActivatedRoute,
        useValue: activatedRoute,
      },
      ...extraProviders,
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });
}
