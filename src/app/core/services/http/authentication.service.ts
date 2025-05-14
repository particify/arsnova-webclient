import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  switchAll,
  switchMap,
  shareReplay,
  take,
  tap,
} from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import {
  AuthenticationStatus,
  ClientAuthenticationResult,
} from '@app/core/models/client-authentication-result';
import { EventService } from '@app/core/services/util/event.service';
import { jwtDecode } from 'jwt-decode';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ApiConfigService } from './api-config.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { environment } from '@environments/environment';
import { AuthProvider } from '@app/core/models/auth-provider';

export const AUTH_HEADER_KEY = 'Authorization';
export const AUTH_SCHEME = 'Bearer';
const REFRESH_INTERVAL_MINUTES = 30;
const REFRESH_INTERVAL_MAX_OFFSET_MINUTES = 2;
const REFRESH_INTERVAL_STARTDUE_MINUTES = 5;

interface Jwt {
  roles: string[];
}

/**
 * Handles app-wide user authentication.
 */
@Injectable()
export class AuthenticationService extends AbstractHttpService<ClientAuthentication> {
  private globalStorageService = inject(GlobalStorageService);
  eventService: EventService;
  private http: HttpClient;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;
  private apiConfigService = inject(ApiConfigService);
  private routingService = inject(RoutingService);
  private router = inject(Router);

  private readonly ADMIN_ROLE: string = 'ADMIN';
  private popupDimensions = [500, 500];
  private singleLogoutEnabled = false;

  /**
   * Higher-order Observable which provides a stream of changes to
   * authentication including those which have pending requests.
   */
  private auth$$: BehaviorSubject<Observable<ClientAuthentication>>;

  private httpOptions = {
    headers: new HttpHeaders({}),
  };

  serviceApiUrl = {
    guest: '/guest',
    login: '/login',
    registered: '/registered',
    sso: '/sso',
  };

  constructor() {
    const eventService = inject(EventService);
    const http = inject(HttpClient);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);

    super('/auth', http, eventService, translateService, notificationService);
    this.eventService = eventService;
    this.http = http;
    this.translateService = translateService;
    this.notificationService = notificationService;

    const savedAuth: ClientAuthentication = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    );
    this.auth$$ = new BehaviorSubject(of(savedAuth));
  }

  /**
   * Initialize authentication at startup.
   */
  init() {
    if (!environment.production) {
      this.getAuthenticationChanges().subscribe((auth) => {
        console.log('Authentication changed', auth);
      });
    }

    this.apiConfigService.getApiConfig$().subscribe((config) => {
      const popupDimensions = /^([0-9]+)x([0-9]+)$/.exec(
        config.ui.sso?.popup?.dimensions || ''
      );
      if (popupDimensions) {
        this.popupDimensions = [+popupDimensions[1], +popupDimensions[2]];
      }
      this.singleLogoutEnabled = !!config.ui.sso?.singleLogoutEnabled;
    });
    const offset =
      REFRESH_INTERVAL_MAX_OFFSET_MINUTES * Math.random() * 60 * 1000;
    const interval = REFRESH_INTERVAL_MINUTES * 60 * 1000 + offset;
    const startDue = Math.min(
      interval,
      REFRESH_INTERVAL_STARTDUE_MINUTES * 60 * 1000 + offset
    );
    timer(startDue, interval).subscribe(() => {
      if (this.getCurrentAuthentication() != null) {
        this.refreshLogin().subscribe();
      }
    });
  }

  /**
   * Returns the changes to authentication as a stream.
   */
  getAuthenticationChanges(): Observable<ClientAuthentication> {
    return this.auth$$.pipe(switchAll());
  }

  /**
   * Returns the current authentication.
   */
  getCurrentAuthentication(): Observable<ClientAuthentication> {
    return this.auth$$.pipe(switchAll(), first());
  }

  /**
   * Returns the current authentication. If no authentication is available, a
   * login as guest is performed.
   */
  requireAuthentication(): Observable<ClientAuthentication | undefined> {
    return this.auth$$.pipe(
      switchAll(),
      first(),
      switchMap((auth) => {
        if (auth) {
          return of(auth);
        }

        return this.loginGuest().pipe(map((result) => result.authentication));
      })
    );
  }

  /**
   * Authenticates a user using loginId (username or email) and password.
   */
  login(
    loginId: string,
    password: string,
    providerId = 'user-db'
  ): Observable<ClientAuthenticationResult> {
    const providerPath =
      providerId === 'user-db'
        ? this.serviceApiUrl.registered
        : '/' + providerId;
    const connectionUrl: string = this.buildUri(
      this.serviceApiUrl.login + providerPath
    );

    return this.handleLoginResponse(
      this.http.post<ClientAuthentication>(
        connectionUrl,
        {
          loginId: loginId,
          password: password,
        },
        this.httpOptions
      ),
      this.isLoggedIn()
    );
  }

  /**
   * Sends a refresh request using current authentication to extend the
   * validity.
   */
  refreshLogin(): Observable<ClientAuthenticationResult | null> {
    // Load user authentication from local data store if available
    const savedAuth: ClientAuthentication = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    );
    const guestToken: string = this.globalStorageService.getItem(
      STORAGE_KEYS.GUEST_TOKEN
    );
    const token: string = savedAuth?.token || guestToken;
    const guest = token === guestToken;
    if (!token) {
      return of(null);
    }

    const connectionUrl: string = this.buildUri(
      this.serviceApiUrl.login + '?refresh=true'
    );
    const loginHttpHeaders = this.httpOptions.headers.set(
      AUTH_HEADER_KEY,
      `${AUTH_SCHEME} ${token}`
    );
    const auth$ = this.http.post<ClientAuthentication>(
      connectionUrl,
      {},
      { headers: loginHttpHeaders }
    );
    return this.handleLoginResponse(auth$).pipe(
      tap((result) => {
        if (result.status === AuthenticationStatus.INVALID_CREDENTIALS) {
          console.error('Could not refresh authentication (expired).');
          if (!guest) {
            if (this.router.url.startsWith('/embed')) {
              this.router.navigate(['embed', 'external-login']);
            } else {
              this.handleUnauthorizedError();
            }
          }
        } else if (result.status === AuthenticationStatus.UNKNOWN_ERROR) {
          console.error('Could not refresh authentication.');
          // Restore authentication from existing credentials if refreshing
          // fails. It does not matter here that the token might have expired.
          this.auth$$.next(of(savedAuth));
        } else if (result.status === AuthenticationStatus.SUCCESS && guest) {
          this.globalStorageService.setItem(
            STORAGE_KEYS.GUEST_TOKEN,
            result.authentication?.token
          );
        }
      })
    );
  }

  /**
   * Fetches guest authentication data withouth changing the local
   * authentication state.
   */
  fetchGuestAuthentication(): Observable<ClientAuthentication> {
    const token = this.getGuestToken();
    const httpHeaders = this.httpOptions.headers.set(
      AUTH_HEADER_KEY,
      `${AUTH_SCHEME} ${token}`
    );
    const connectionUrl: string = this.buildUri(
      this.serviceApiUrl.login + this.serviceApiUrl.guest
    );
    return this.http.post<ClientAuthentication>(connectionUrl, null, {
      headers: httpHeaders,
    });
  }

  getGuestToken(): string {
    return this.globalStorageService.getItem(STORAGE_KEYS.GUEST_TOKEN);
  }

  /**
   * Authenticates a guest user using existing credentials or creates a new
   * guest account.
   */
  loginGuest(): Observable<ClientAuthenticationResult> {
    const connectionUrl: string = this.buildUri(
      this.serviceApiUrl.login + this.serviceApiUrl.guest
    );
    /* The global storage service is not used for guestToken because it is a legacy item. */
    const guestLoginId = localStorage.getItem('guestToken');
    const payload = guestLoginId ? { loginId: guestLoginId } : null;
    return this.refreshLogin().pipe(
      switchMap((result) => {
        localStorage.removeItem('guestToken');
        if (
          !result ||
          result.status === AuthenticationStatus.INVALID_CREDENTIALS
        ) {
          /* Create new guest account */
          const loginResult$ = this.handleLoginResponse(
            this.http.post<ClientAuthentication>(
              connectionUrl,
              payload,
              this.httpOptions
            )
          ).pipe(
            tap((loginResult) => {
              if (loginResult.status === AuthenticationStatus.SUCCESS) {
                this.globalStorageService.setItem(
                  STORAGE_KEYS.GUEST_TOKEN,
                  loginResult.authentication?.token
                );
              }
            })
          );

          return loginResult$;
        }

        /* Return existing account */
        return of(result);
      })
    );
  }

  /**
   * Open the SSO login page in a popup and check the result.
   *
   * @param providerId ID of the SSO provider
   * @param userRole User role for the UI
   */
  loginViaSso(providerId: string): Observable<ClientAuthenticationResult> {
    const ssoUrl = this.buildUri(this.serviceApiUrl.sso + '/' + providerId);
    const loginUrl = this.buildUri(this.serviceApiUrl.login + '?refresh=true');
    const popup = this.openSsoPopup(ssoUrl);
    const auth$ = timer(0, 500).pipe(
      map(() => popup?.closed),
      filter((closed) => closed || false),
      concatMap(() =>
        this.http.post<ClientAuthentication>(loginUrl, null, {
          withCredentials: true,
        })
      ),
      take(1)
    );

    if (!popup) {
      location.href = ssoUrl;
    }

    return this.handleLoginResponse(auth$, this.isLoggedIn());
  }

  /**
   * Completes the login process using a cookie set by the backend.
   */
  completeLogin() {
    const restoreGuestLogin = this.isLoggedIn();
    const loginUrl = this.buildUri(this.serviceApiUrl.login + '?refresh=true');
    const auth$ = this.http.post<ClientAuthentication>(loginUrl, null, {
      withCredentials: true,
    });
    return this.handleLoginResponse(auth$, restoreGuestLogin);
  }

  /**
   * Resets the local authentication state.
   */
  logout() {
    this.globalStorageService.removeItem(STORAGE_KEYS.USER);
    this.getCurrentAuthentication().subscribe((auth) => {
      // FIXME: This is currently needed to assign null
      // This should be refactored at some point
      // eslint-disable-next-line
      // @ts-ignore
      this.auth$$.next(of(null));
      if (
        this.singleLogoutEnabled &&
        [AuthProvider.OIDC, AuthProvider.SAML].includes(auth.authProvider)
      ) {
        const url = this.buildUri(
          `${this.serviceApiUrl.sso}/${auth.authProvider.toLowerCase()}/logout`
        );
        const popup = this.openSsoPopup(url);
        if (!popup) {
          location.href = url;
        }
      }
    });
  }

  private openSsoPopup(url: string): Window | null {
    const [popupW, popupH] = this.popupDimensions;
    const popupX = window.screenX + window.outerWidth / 2 - popupW / 2;
    const popupY = window.screenY + window.outerHeight / 2 - popupH / 2;
    return window.open(
      url,
      'auth_popup',
      `left=${popupX},top=${popupY},width=${popupW},height=${popupH},resizable`
    );
  }

  /**
   * Returns the current login state ignoring pending authentication requests.
   */
  isLoggedIn(): boolean {
    return !!this.globalStorageService.getItem(STORAGE_KEYS.USER);
  }

  hasAdminRole(auth: ClientAuthentication) {
    const decodedToken = jwtDecode<Jwt>(auth.token);
    return decodedToken.roles.some((role) => role === this.ADMIN_ROLE);
  }

  isLoginIdEmailAddress(): Observable<boolean> {
    // While other authentication providers might also use an e-mail address,
    // we only consider this to be the case for internal accounts.
    return this.apiConfigService
      .getApiConfig$()
      .pipe(
        map((config) =>
          config.authenticationProviders.every((p) =>
            ['user-db', 'guest'].includes(p.id)
          )
        )
      );
  }

  /**
   * Resets the local authentication state and redirects to the login page.
   * Furthermore, the current route is stored so it can be restored after
   * login.
   */
  handleUnauthorizedError() {
    this.logout();
    this.routingService.setRedirect(undefined, true);
    this.router.navigateByUrl('login');
    this.translateService
      .selectTranslate('login.authentication-expired')
      .pipe(take(1))
      .subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
  }

  /**
   * Updates the local authentication state based on the server response.
   */
  private handleLoginResponse(
    clientAuthentication$: Observable<ClientAuthentication>,
    restoreGuestOnFailure?: boolean
  ): Observable<ClientAuthenticationResult> {
    const auth$ = clientAuthentication$.pipe(
      map((auth) => {
        if (auth) {
          this.globalStorageService.setItem(STORAGE_KEYS.USER, auth);

          return new ClientAuthenticationResult(auth);
        } else {
          return new ClientAuthenticationResult(
            undefined,
            AuthenticationStatus.UNKNOWN_ERROR
          );
        }
      }),
      shareReplay(),
      catchError((e) => {
        // check if user needs activation
        if (e.error?.errorType === 'DisabledException') {
          return of(
            new ClientAuthenticationResult(
              undefined,
              AuthenticationStatus.ACTIVATION_PENDING
            )
          );
        } else if (e.status === 401 || e.status === 403) {
          return of(
            new ClientAuthenticationResult(
              undefined,
              AuthenticationStatus.INVALID_CREDENTIALS
            )
          );
        }
        return of(
          new ClientAuthenticationResult(
            undefined,
            AuthenticationStatus.UNKNOWN_ERROR
          )
        );
      })
    );
    /* Publish authentication (w/o result meta data) */
    this.auth$$.next(
      auth$.pipe(
        map((result) => result.authentication as ClientAuthentication),
        tap((auth) => restoreGuestOnFailure && !auth && this.loginGuest())
      )
    );

    return auth$;
  }
}
