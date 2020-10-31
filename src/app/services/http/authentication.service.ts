import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, concatMap, filter, first, map, switchAll, switchMap, shareReplay, take, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';
import { ClientAuthentication } from '../../models/client-authentication';
import { AuthenticationStatus, ClientAuthenticationResult } from '../../models/client-authentication-result';
import { EventService } from '../util/event.service';
import * as JwtDecode from 'jwt-decode';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';

export const AUTH_HEADER_KEY = 'Authorization';
export const AUTH_SCHEME = 'Bearer';
const REFRESH_INTERVAL_MINUTES = 30;
const REFRESH_INTERVAL_MAX_OFFSET_MINUTES = 2;

/**
 * Handles app-wide user authentication.
 */
@Injectable()
export class AuthenticationService extends BaseHttpService {
  private readonly ADMIN_ROLE: string = 'ADMIN';

  /**
   * Higher-order Observable which provides a stream of changes to
   * authentication including those which have pending requests.
   */
  private auth$$: BehaviorSubject<Observable<ClientAuthentication>>;

  private apiUrl = {
    base: '/api',
    auth: '/auth',
    login: '/login',
    user: '/user',
    registered: '/registered',
    guest: '/guest',
    sso: '/sso',
    membership: '/_view/membership'
  };
  private httpOptions = {
    headers: new HttpHeaders({})
  };

  private redirect: string;

  constructor(
    private globalStorageService: GlobalStorageService,
    public eventService: EventService,
    private http: HttpClient,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
    const savedAuth: ClientAuthentication = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    this.auth$$ = new BehaviorSubject(new BehaviorSubject(savedAuth));
  }

  /**
   * Initialize authentication at startup.
   */
  init() {
    if (this.isLoggedIn()) {
      this.refreshLogin().subscribe();
    }

    this.getAuthenticationChanges().subscribe(auth => {
      console.log('Authentication changed', auth);
    });
    const interval = REFRESH_INTERVAL_MINUTES * 60 * 1000
        + REFRESH_INTERVAL_MAX_OFFSET_MINUTES * Math.random() * 60 * 1000;
    setInterval(() => {
      if (this.getCurrentAuthentication() != null) {
        this.refreshLogin();
      }
    }, interval);
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
  requireAuthentication(): Observable<ClientAuthentication> {
    return this.auth$$.pipe(switchAll(), first(), switchMap(auth => {
      if (auth) {
        return of(auth);
      }

      return this.loginGuest().pipe(map(result => result.authentication));
    }));
  }

  /**
   * Authenticates a user using loginId (username or email) and password.
   */
  login(loginId: string, password: string): Observable<ClientAuthenticationResult> {
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.registered;

    return this.handleLoginResponse(this.http.post<ClientAuthentication>(connectionUrl, {
      loginId: loginId,
      password: password
    }, this.httpOptions), this.isLoggedIn());
  }

  /**
   * Sends a refresh request using current authentication to extend the
   * validity.
   */
  refreshLogin(): Observable<ClientAuthenticationResult | null> {
    // Load user authentication from local data store if available
    const savedAuth = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    const token: string = savedAuth?.token || this.globalStorageService.getItem(STORAGE_KEYS.GUEST_TOKEN);
    if (!token) {
      return of(null);
    }

    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + '?refresh=true';
    const loginHttpHeaders = this.httpOptions.headers.set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${token}`);
    const auth$ = this.http.post<ClientAuthentication>(connectionUrl, {}, { headers: loginHttpHeaders });
    return this.handleLoginResponse(auth$).pipe(
        tap(result => {
          if (result.status === AuthenticationStatus.INVALID_CREDENTIALS) {
            console.error('Could not refresh authentication.');
            this.logout();
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
    const httpHeaders = this.httpOptions.headers.set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${token}`);
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.guest;
    return this.http.post<ClientAuthentication>(connectionUrl, null, { headers: httpHeaders });
  }

  getGuestToken(): string {
    return this.globalStorageService.getItem(STORAGE_KEYS.GUEST_TOKEN);
  }

  /**
   * Authenticates a guest user using existing credentials or creates a new
   * guest account.
   */
  loginGuest(): Observable<ClientAuthenticationResult> {
    return this.refreshLogin().pipe(switchMap(result => {
      if (!result || result.status === AuthenticationStatus.INVALID_CREDENTIALS) {
        /* Create new guest account */
        const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.guest;
        const loginResult$ = this.handleLoginResponse(
            this.http.post<ClientAuthentication>(connectionUrl, null, this.httpOptions)).pipe(tap(loginResult => {
              if (loginResult.status === AuthenticationStatus.SUCCESS) {
                this.globalStorageService.setItem(STORAGE_KEYS.GUEST_TOKEN, loginResult.authentication.token);
              }
            })
        );

        return loginResult$;
      }

      /* Return existing account */
      return of(result);
    }));
  }

  /**
   * Open the SSO login page in a popup and check the result.
   *
   * @param providerId ID of the SSO provider
   * @param userRole User role for the UI
   */
  loginViaSso(providerId: string): Observable<ClientAuthenticationResult> {
    const ssoUrl = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.sso + '/' + providerId;
    const loginUrl = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + '?refresh=true';
    const popupW = 500;
    const popupH = 500;
    const popupX = window.top.screenX + window.top.outerWidth / 2 - popupW / 2;
    const popupY = window.top.screenY + window.top.outerHeight / 2 - popupH / 2;
    const popup = window.open(ssoUrl, 'auth_popup',
      `left=${popupX},top=${popupY},width=${popupW},height=${popupH},resizable`);
    const auth$ = timer(0, 500).pipe(
      map(() => popup.closed),
      filter((closed) => closed),
      concatMap(() => this.http.post<ClientAuthentication>(loginUrl, null, { withCredentials: true })),
      take(1));

    return this.handleLoginResponse(auth$, this.isLoggedIn());
  }

  /**
   * Resets the local authentication state.
   */
  logout() {
    this.globalStorageService.removeItem(STORAGE_KEYS.USER);
    this.auth$$.next(of(null));
  }

  /**
   * Returns the current login state ignoring pending authentication requests.
   */
  isLoggedIn(): boolean {
    return !!this.globalStorageService.getItem(STORAGE_KEYS.USER);
  }

  hasAdminRole(auth: ClientAuthentication) {
    const decodedToken = JwtDecode(auth.token);
    return decodedToken.roles.some(role => role === this.ADMIN_ROLE);
  }

  /**
   * Updates the local authentication state based on the server response.
   */
  private handleLoginResponse(
      clientAuthentication$: Observable<ClientAuthentication>,
      restoreGuestOnFailure?: boolean
  ): Observable<ClientAuthenticationResult> {
    const auth$ = clientAuthentication$.pipe(
        map(auth => {
          if (auth) {
            this.globalStorageService.setItem(STORAGE_KEYS.USER, auth);

            return new ClientAuthenticationResult(auth);
          } else {
            return new ClientAuthenticationResult(null, AuthenticationStatus.UNKNOWN_ERROR);
          }
        }),
        shareReplay(),
        catchError((e) => {
          // check if user needs activation
          if (e.error?.errorType === 'DisabledException') {
            return of(new ClientAuthenticationResult(null, AuthenticationStatus.ACTIVATION_PENDING));
          } else if (e.status === 401 || e.status === 403) {
            return of(new ClientAuthenticationResult(null, AuthenticationStatus.INVALID_CREDENTIALS));
          }
          return of(new ClientAuthenticationResult(null, AuthenticationStatus.UNKNOWN_ERROR));
        })
    );
    /* Publish authentication (w/o result meta data) */
    this.auth$$.next(auth$.pipe(
        map(result => result.authentication),
        tap(auth => restoreGuestOnFailure && !auth && this.loginGuest())
    ));

    return auth$;
  }

  setRedirect(url: string) {
    this.redirect = url;
  }

  getRedirect(): string {
    return this.redirect;
  }

  resetRedirect() {
    this.redirect = null;
  }
}
