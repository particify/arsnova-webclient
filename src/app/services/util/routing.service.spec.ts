import { TestBed, inject } from '@angular/core/testing';

import { RoutingService } from '@arsnova/app/services/util/routing.service';
import {
  MockLangService,
  MockRouter,
  MockTranslateService,
  MockGlobalStorageService,
} from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { UserRole } from '../../models/user-roles.enum';
import { Room } from '../../models/room';

describe('RoutingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutingService,
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: Location,
          useClass: MockLocationStrategy,
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
  });

  it('should be created', inject(
    [RoutingService],
    (service: RoutingService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should get correct back route on user page when back route is undefined', inject(
    [RoutingService],
    (service: RoutingService) => {
      service.backRoute = undefined;
      service.currentRoute = 'user';
      service.getBackRoute('', '', '');
      expect(service.backRoute).toEqual(['']);
    }
  ));

  it('should get correct back route on user page when back route is set to user', inject(
    [RoutingService],
    (service: RoutingService) => {
      service.backRoute = ['user'];
      service.currentRoute = 'user';
      service.getBackRoute('', '', '');
      expect(service.backRoute).toEqual(['']);
    }
  ));

  it('should get correct back route on login page', inject(
    [RoutingService],
    (service: RoutingService) => {
      service.currentRoute = 'login';
      service.getBackRoute('', '', '');
      expect(service.backRoute).toEqual(['']);
    }
  ));

  it('should get correct back route on room page', inject(
    [RoutingService],
    (service: RoutingService) => {
      service.currentRoute = '';
      service.getBackRoute(UserRole.EXECUTIVE_MODERATOR, '', ':shortId');
      expect(service.backRoute).toEqual(['user']);
    }
  ));

  it('should get correct back route on room comments page', inject(
    [RoutingService],
    (service: RoutingService) => {
      const snapshot = new ActivatedRouteSnapshot();
      snapshot.params = { shortId: '12345678' };
      snapshot.data = {
        userRole: UserRole.CREATOR,
        room: new Room(),
        viewRole: UserRole.EXECUTIVE_MODERATOR,
      };
      service.getRoomUrlData(snapshot);
      service.currentRoute = 'comments';
      service.getBackRoute(UserRole.EXECUTIVE_MODERATOR, '', ':shortId');
      expect(service.backRoute).toEqual(['edit', '12345678']);
    }
  ));
});
