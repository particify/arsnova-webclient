import { inject } from '@angular/core/testing';
import { RoutingService } from '@app/core/services/util/routing.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiConfig } from '@app/core/models/api-config';
import { configureTestModule } from '@testing/test.setup';
import { UserRole } from '@app/core/models/user-roles.enum';

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
        readOnly: false,
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
        readOnly: false,
      };
      const route = service.getRoute(url, config);
      expect(route).toBe('https://short/segment1/segment2');
    }
  ));

  describe('presentation URL', () => {
    function presentationUrl(service: RoutingService, url: string) {
      service.role = UserRole.OWNER;
      return service.getPresentationUrl(url);
    }

    it('presents the questionnaire instead of its content creation', inject(
      [RoutingService],
      (service: RoutingService) => {
        expect(
          presentationUrl(service, '/edit/12345678/questionnaire/q-1/create')
        ).toBe('present/12345678/questionnaire/q-1');
      }
    ));

    it('presents the content that is being edited', inject(
      [RoutingService],
      (service: RoutingService) => {
        expect(
          presentationUrl(service, '/edit/12345678/questionnaire/q-1/edit/c-1')
        ).toBe('present/12345678/questionnaire/q-1/c-1');
      }
    ));

    it('presents a selected content as it is', inject(
      [RoutingService],
      (service: RoutingService) => {
        expect(
          presentationUrl(service, '/edit/12345678/questionnaire/q-1/c-1')
        ).toBe('present/12345678/questionnaire/q-1/c-1');
      }
    ));

    it('presents the questionnaire instead of its leaderboard', inject(
      [RoutingService],
      (service: RoutingService) => {
        expect(
          presentationUrl(
            service,
            '/edit/12345678/questionnaire/q-1/leaderboard'
          )
        ).toBe('present/12345678/questionnaire/q-1');
      }
    ));
  });
});
