import { TestBed, inject } from '@angular/core/testing';

import { RoutingService } from '@app/core/services/util/routing.service';
import { MockGlobalStorageService } from '@testing/test-helpers';
import { ActivatedRouteSnapshot, Router, UrlSegment } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Room } from '@app/core/models/room';
import { ParentRoute } from '@app/core/models/parent-route';
import { ApiConfig } from '@app/core/models/api-config';

class MockLocation {
  back = jasmine.createSpy('BackSpy');
  onUrlChange = jasmine.createSpy('OnUrlChangeSpy').and.returnValue('');
}

describe('RoutingService', () => {
  let location: Location;
  const routerSpy = jasmine.createSpyObj('MockRouter', [
    'navigate',
    'navigateByUrl',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutingService,
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: Location,
          useClass: MockLocation,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
    location = TestBed.inject(Location);
  });

  it('should be created', inject(
    [RoutingService],
    (service: RoutingService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should get correct back route on user page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.data = {
        parentRoute: ParentRoute.HOME,
      };
      Object.defineProperty(snapshot, 'title', { value: 'user' });
      service.getBackRoute(snapshot, UserRole.PARTICIPANT);
      service.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
    }
  ));

  it('should get correct back route on login page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.data = {
        parentRoute: ParentRoute.HOME,
      };
      Object.defineProperty(snapshot, 'title', { value: 'login' });
      service.getBackRoute(snapshot, UserRole.PARTICIPANT);
      service.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
    }
  ));

  it('should get correct back route on register page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.data = {
        parentRoute: ParentRoute.LOGIN,
      };
      Object.defineProperty(snapshot, 'title', { value: 'register' });
      service.getBackRoute(snapshot, UserRole.PARTICIPANT);
      service.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
    }
  ));

  it('should get correct back route on room overview page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.data = {
        parentRoute: ParentRoute.USER,
      };
      Object.defineProperty(snapshot, 'title', { value: 'room' });
      service.getBackRoute(snapshot, UserRole.PARTICIPANT);
      service.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['user']);
    }
  ));

  it('should get correct back route on comments page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.params = { shortId: '12345678' };
      snapshot.data = {
        userRole: UserRole.OWNER,
        room: new Room(),
        viewRole: UserRole.MODERATOR,
        parentRoute: ParentRoute.ROOM,
      };
      Object.defineProperty(snapshot, 'title', { value: 'comments' });
      service.getRoomUrlData(snapshot);
      service.getBackRoute(snapshot, UserRole.OWNER);
      service.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['edit', '12345678']);
    }
  ));

  it('should use location back navigation if parent route is not defined', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.data = {};
      Object.defineProperty(snapshot, 'title', { value: 'room' });
      service.getBackRoute(snapshot, UserRole.PARTICIPANT);
      service.goBack();
      expect(location.back).toHaveBeenCalled();
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
