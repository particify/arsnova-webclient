import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, concatMap, filter, map, switchAll, switchMap, shareReplay, take, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';
import { ClientAuthentication } from '../../models/client-authentication';
import { AuthenticationStatus, ClientAuthenticationResult } from '../../models/client-authentication-result';
import { EventService } from '../util/event.service';
import * as JwtDecode from 'jwt-decode';

export const AUTH_HEADER_KEY = 'Authorization';
export const AUTH_SCHEME = 'Bearer';

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
  private loggedIn: boolean;

  constructor(
    private globalStorageService: GlobalStorageService,
    public eventService: EventService,
    private http: HttpClient
  ) {
    super();
    const savedAuth: ClientAuthentication = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    this.loggedIn = !!this.globalStorageService.getItem(STORAGE_KEYS.LOGGED_IN);
    this.auth$$ = new BehaviorSubject(new BehaviorSubject(this.loggedIn ? savedAuth : null));

    this.getAuthenticationChanges().subscribe(auth => {
      console.log('Authentication changed', auth);
      if (auth) {
        this.globalStorageService.setItem(STORAGE_KEYS.USER, auth);
      }
      this.loggedIn = this.loggedIn && !!auth;
      this.globalStorageService.setItem(STORAGE_KEYS.LOGGED_IN, this.loggedIn);
    });
  }

  /**
   * Returns a stream of changes to the authentication.
   */
  getAuthenticationChanges(): Observable<ClientAuthentication> {
    return this.auth$$.pipe(
      switchAll()
    );
  }

  /**
   * Create a replayable, multicastable authentication Observable and emit it.
   */
  private emitAuthentication(auth$: Observable<ClientAuthentication>): Observable<ClientAuthentication> {
    const sharableAuth$ = auth$.pipe(shareReplay());
    this.auth$$.next(sharableAuth$);

    return sharableAuth$;
  }

  /**
   * Authenticates a user using loginId (username or email) and password.
   */
  login(loginId: string, password: string): Observable<ClientAuthenticationResult> {
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.registered;

    return this.handleLoginResponse(this.http.post<ClientAuthentication>(connectionUrl, {
      loginId: loginId,
      password: password
    }, this.httpOptions));
  }

  /**
   * Sends a refresh request using current authentication to extend the
   * validity.
   */
  refreshLogin(): Observable<ClientAuthenticationResult | null> {
    // Load user authentication from local data store if available
    const savedAuth = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    if (!savedAuth) {
      return of(null);
    }

    const token: string = savedAuth.token;
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + '?refresh=true';
    const loginHttpHeaders = this.httpOptions.headers.set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${token}`);
    const auth$ = this.http.post<ClientAuthentication>(connectionUrl, {}, { headers: loginHttpHeaders });
    return this.handleLoginResponse(auth$).pipe(
        tap(result => {
          if (result.status === AuthenticationStatus.INVALID_CREDENTIALS) {
            console.error('Could not refresh authentication.');
            this.globalStorageService.removeItem(STORAGE_KEYS.USER);
            this.logout();
          }
        }),
        catchError(e => {
          return of(new ClientAuthenticationResult(null, null))
        })
    );
  }

  /**
   * Authenticates a guest user using existing credentials or creates a new
   * guest account.
   */
  loginGuest(): Observable<ClientAuthenticationResult> {
    return this.refreshLogin().pipe(switchMap(result => {
      if (!result) {
        /* Create new guest account */
        const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.guest;

        return this.handleLoginResponse(this.http.post<ClientAuthentication>(connectionUrl, null, this.httpOptions));
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

    return this.handleLoginResponse(auth$);
  }

  logout() {
    // Destroy the persisted user data
    // Actually don't destroy it because we want to preserve guest accounts in local storage
    // this.dataStoreService.remove(this.STORAGE_KEY);

    this.loggedIn = false;
    this.globalStorageService.removeItem(STORAGE_KEYS.LOGGED_IN);
    this.emitAuthentication(of(null));
  }

  /**
   * Returns the current login state ignoring pending authentication requests.
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  hasAdminRole(auth: ClientAuthentication) {
    const decodedToken = JwtDecode(auth.token);
    return decodedToken.roles.some(role => role === this.ADMIN_ROLE);
  }

  /**
   * Updates the local authentication state based on the server response.
   */
  private handleLoginResponse(clientAuthentication$: Observable<ClientAuthentication>): Observable<ClientAuthenticationResult> {
    const auth$ = this.emitAuthentication(clientAuthentication$);

    return auth$.pipe(map(auth => {
      if (auth) {
        this.globalStorageService.setItem(STORAGE_KEYS.USER, auth);
        this.globalStorageService.setItem(STORAGE_KEYS.LOGGED_IN, true);
        this.loggedIn = true;

        return new ClientAuthenticationResult(auth);
      } else {
        return new ClientAuthenticationResult(null, AuthenticationStatus.UNKNOWN_ERROR);
      }
    }), catchError((e) => {
      // check if user needs activation
      if (e.error?.errorType === 'DisabledException') {
        return of(new ClientAuthenticationResult(null, AuthenticationStatus.ACTIVATION_PENDING));
      } else if (e.status === 401 || e.status === 403) {
        return of(new ClientAuthenticationResult(null, AuthenticationStatus.INVALID_CREDENTIALS));
      }
      return of(new ClientAuthenticationResult(null, AuthenticationStatus.UNKNOWN_ERROR));
    }));
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
