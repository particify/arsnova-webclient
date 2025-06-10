import { inject } from '@angular/core/testing';
import { RoutingService } from '@app/core/services/util/routing.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiConfig } from '@app/core/models/api-config';
import { configureTestModule } from '@testing/test.setup';

class MockLocation {
  back = jasmine.createSpy('BackSpy');
  onUrlChange = jasmine.createSpy('OnUrlChangeSpy').and.returnValue('');
}

describe('RoutingService', () => {
  const routerSpy = jasmine.createSpyObj('MockRouter', [
    'navigate',
    'navigateByUrl',
  ]);

  beforeEach(() => {
    configureTestModule(
      [],
      [
        RoutingService,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: Location,
          useClass: MockLocation,
        },
      ]
    );
  });

  it('should be created', inject(
    [RoutingService],
    (service: RoutingService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should return correct route when calling getRoute with no shortener and url array', inject(
    [RoutingService],
    (service: RoutingService) => {
      const url = ['segment1', 'segment2'];
      const config: ApiConfig = {
        authenticationProviders: [],
        features: {},
        ui: { links: {} },
      };
      const route = service.getRoute(url, config);
      expect(route).toBe(document.baseURI + 'segment1/segment2');
    }
  ));

  it('should return correct route when calling getRoute with shortener and url array', inject(
    [RoutingService],
    (service: RoutingService) => {
      const url = ['segment1', 'segment2'];
      const config: ApiConfig = {
        authenticationProviders: [],
        features: {},
        ui: { links: { join: { url: 'https://short/' } } },
      };
      const route = service.getRoute(url, config);
      expect(route).toBe('https://short/segment1/segment2');
    }
  ));
});
