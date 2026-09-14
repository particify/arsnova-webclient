import { HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { CurrentUserGql } from '@gql/generated/graphql';
import { MockRouter } from '@testing/test-helpers';
import { configureTestModule } from '@testing/test.setup';
import { NEVER, of } from 'rxjs';

const REFRESH_URI = '/api/auth/refresh';
const LOGOUT_URI = '/api/auth/logout';
const ACCESS_TOKEN = 'access-token';
const EXPIRATION_MESSAGE_KEY = 'login.authentication-expired';
const USER = new AuthenticatedUser('user-id', true, 'user@example.com');

@Injectable()
class MockGlobalStorageService {
  private items = new Map<symbol, unknown>();

  getItem(key: symbol) {
    return this.items.get(key);
  }

  setItem(key: symbol, value: unknown) {
    this.items.set(key, value);
  }

  removeItem(key: symbol) {
    this.items.delete(key);
  }
}

@Injectable()
class MockCurrentUserGql {
  watch() {
    return {
      valueChanges: NEVER,
      refetch: () => Promise.resolve(),
    };
  }
}

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let globalStorageService: MockGlobalStorageService;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let routingService: jasmine.SpyObj<RoutingService>;
  let router: MockRouter;
  let service: AuthenticationService;

  beforeEach(() => {
    globalStorageService = new MockGlobalStorageService();
    globalStorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, ACCESS_TOKEN);
    globalStorageService.setItem(STORAGE_KEYS.USER, USER);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    routingService = jasmine.createSpyObj('RoutingService', ['setRedirect']);
    // Translations are not loaded, so the key is passed through as message.
    const translateService = jasmine.createSpyObj('TranslocoService', [
      'selectTranslate',
    ]);
    translateService.selectTranslate.and.callFake((key: string) => of(key));
    const testBed = configureTestModule(
      [],
      [
        AuthenticationService,
        {
          provide: GlobalStorageService,
          useValue: globalStorageService,
        },
        {
          provide: CurrentUserGql,
          useClass: MockCurrentUserGql,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: RoutingService,
          useValue: routingService,
        },
        {
          provide: TranslocoService,
          useValue: translateService,
        },
      ]
    );
    httpTestingController = testBed.inject(HttpTestingController);
    router = testBed.inject(Router) as unknown as MockRouter;
    service = testBed.inject(AuthenticationService);
  });

  /** Asserts that the user has been informed about the ended session. */
  const expectRedirectToLogin = () => {
    expect(routingService.setRedirect).toHaveBeenCalledWith(undefined, true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('login');
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      EXPIRATION_MESSAGE_KEY,
      AdvancedSnackBarTypes.WARNING
    );
  };

  /** Asserts that the session has been kept. */
  const expectNoRedirectToLogin = () => {
    expect(routingService.setRedirect).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  };

  afterEach(() => {
    // Assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('refreshLogin', () => {
    it('should update the access token if the refresh succeeds', () => {
      const newAccessToken = 'new-access-token';
      service.refreshLogin().subscribe();
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush({ accessToken: newAccessToken });

      expect(service.accessToken()).toEqual(newAccessToken);
      expect(globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toEqual(
        newAccessToken
      );
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toEqual(USER);
      expectNoRedirectToLogin();
      service
        .getCurrentAuthentication()
        .subscribe((auth) => expect(auth).toEqual(USER));
    });

    it('should reset the local authentication state if the refresh fails with error code 401', () => {
      service.refreshLogin().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 401, statusText: 'Error 401' });

      expect(service.accessToken()).toBeUndefined();
      expect(
        globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      ).toBeUndefined();
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toBeUndefined();
      expectRedirectToLogin();
      service
        .getCurrentAuthentication()
        .subscribe((auth) => expect(auth).toBeNull());
    });

    it('should keep the local authentication state if the refresh fails with error code 500', () => {
      service.refreshLogin().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 500, statusText: 'Error 500' });

      expect(service.accessToken()).toEqual(ACCESS_TOKEN);
      expect(globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toEqual(
        ACCESS_TOKEN
      );
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toEqual(USER);
      expectNoRedirectToLogin();
      service
        .getCurrentAuthentication()
        .subscribe((auth) => expect(auth).toEqual(USER));
    });

    it('should keep the local authentication state if the refresh fails because of a network error', () => {
      service.refreshLogin().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .error(new ProgressEvent('error'));

      expect(service.accessToken()).toEqual(ACCESS_TOKEN);
      expect(globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toEqual(
        ACCESS_TOKEN
      );
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toEqual(USER);
      expectNoRedirectToLogin();
      service
        .getCurrentAuthentication()
        .subscribe((auth) => expect(auth).toEqual(USER));
    });

    it('should not inform the user again if the session has already ended', () => {
      service.refreshLogin().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 401, statusText: 'Error 401' });
      notificationService.showAdvanced.calls.reset();
      routingService.setRedirect.calls.reset();
      router.navigateByUrl.calls.reset();

      // A scheduled refresh which runs after the session has ended.
      service.refreshLogin().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 401, statusText: 'Error 401' });

      expectNoRedirectToLogin();
    });
  });

  describe('handleUnauthorizedError', () => {
    it('should inform the user only once if the refresh fails with error code 401', () => {
      service.handleUnauthorizedError().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 401, statusText: 'Error 401' });

      expect(service.accessToken()).toBeUndefined();
      expectRedirectToLogin();

      expect(notificationService.showAdvanced).toHaveBeenCalledTimes(1);
      expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    });

    it('should keep the session if the refresh fails with error code 500', () => {
      service.handleUnauthorizedError().subscribe({ error: () => undefined });
      httpTestingController
        .expectOne({ url: REFRESH_URI, method: 'POST' })
        .flush('Error', { status: 500, statusText: 'Error 500' });

      expect(service.accessToken()).toEqual(ACCESS_TOKEN);
      expectNoRedirectToLogin();
    });

    it('should redirect to the login page without a refresh if the session has already ended', () => {
      service.logout();
      httpTestingController
        .expectOne({ url: LOGOUT_URI, method: 'POST' })
        .flush(null);
      router.navigateByUrl.calls.reset();

      service.handleUnauthorizedError().subscribe();

      expect(router.navigateByUrl).toHaveBeenCalledWith('login');
      expect(notificationService.showAdvanced).not.toHaveBeenCalled();
      // No refresh request is expected. This is asserted by verify() in
      // afterEach().
    });
  });

  describe('logout', () => {
    it('should reset the local authentication state', () => {
      service.logout();
      httpTestingController
        .expectOne({ url: LOGOUT_URI, method: 'POST' })
        .flush(null);

      expect(service.accessToken()).toBeUndefined();
      expect(
        globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      ).toBeUndefined();
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toBeUndefined();
      expectNoRedirectToLogin();
      service
        .getCurrentAuthentication()
        .subscribe((auth) => expect(auth).toBeNull());
    });

    it('should reset the local authentication state if authentication is already expired', () => {
      service.logout();
      httpTestingController
        .expectOne({ url: LOGOUT_URI, method: 'POST' })
        .flush('Error', { status: 401, statusText: 'Error 401' });

      expect(service.accessToken()).toBeUndefined();
      expect(
        globalStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      ).toBeUndefined();
      expect(globalStorageService.getItem(STORAGE_KEYS.USER)).toBeUndefined();
      expectNoRedirectToLogin();
    });
  });
});
