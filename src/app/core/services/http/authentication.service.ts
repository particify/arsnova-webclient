import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
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
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import {
  AuthenticationStatus,
  ClientAuthenticationResult,
} from '@app/core/models/client-authentication-result';
import { jwtDecode } from 'jwt-decode';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { ApiConfigService } from './api-config.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { environment } from '@environments/environment';
import { AuthProvider } from '@app/core/models/auth-provider';
import { Apollo } from 'apollo-angular';
import { ChallengeService } from '@app/core/services/challenge.service';
import { Authentication } from '@app/core/models/authentication';
import { CurrentUserGql } from '@gql/generated/graphql';

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
export class AuthenticationService extends AbstractHttpService<AuthenticatedUser> {
  private globalStorageService = inject(GlobalStorageService);
  private apiConfigService = inject(ApiConfigService);
  private routingService = inject(RoutingService);
  private challengeService = inject(ChallengeService);
  private router = inject(Router);
  private apollo = inject(Apollo, { optional: true });
  private currentUserGql = inject(CurrentUserGql);

  private readonly ADMIN_ROLE: string = 'ADMIN';
  private popupDimensions = [500, 500];
  private singleLogoutEnabled = false;

  /**
   * Higher-order Observable which provides a stream of changes to
   * authentication including those which have pending requests.
   */
  private auth$$: BehaviorSubject<Observable<AuthenticatedUser>>;

  private readonly _accessToken = signal<string | undefined>(undefined);
  get accessToken(): Signal<string | undefined> {
    return this._accessToken;
  }

  private httpOptions = {
    headers: new HttpHeaders({}),
  };

  serviceApiUrl = {
    login: '/login',
    logout: '/logout',
    refresh: '/refresh',
    guest: '/guest-account',
    sso: '/sso',
  };

  constructor() {
    super('/auth');
    const savedAuth: string = this.globalStorageService.getItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );
    if (savedAuth) {
      this._accessToken.set(savedAuth);
    }
    const savedUser: AuthenticatedUser = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    );
    this.auth$$ = new BehaviorSubject(of(savedUser));
  }

  /**
   * Initialize authentication at startup.
   */
  init() {
    this.getAuthenticatedUserChanges().subscribe((auth) => {
      if (!environment.production) {
        console.log('Authenticated user changed', auth);
      }
      this.apollo?.client.clearStore();
    });

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
  getAuthenticatedUserChanges(): Observable<AuthenticatedUser> {
    return this.auth$$.pipe(switchAll());
  }

  /**
   * Returns the current authentication.
   */
  getCurrentAuthentication(): Observable<AuthenticatedUser> {
    return this.auth$$.pipe(switchAll(), first());
  }

  /**
   * Returns the current authentication. If no authentication is available, a
   * login as guest is performed.
   */
  requireAuthentication(): Observable<AuthenticatedUser | undefined> {
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
   * Authenticates a user using username (email) and password.
   */
  login(
    username: string,
    password: string,
    providerId?: string
  ): Observable<ClientAuthenticationResult> {
    if (providerId !== 'user-db') {
      throw new Error(
        'Provider handling for username/password login not yet implemented.'
      );
    }
    const connectionUrl: string = this.buildUri(this.serviceApiUrl.login);
    const token$ = this.challengeService.authenticateByChallenge();
    return token$.pipe(
      switchMap((token) => {
        const httpHeaders = this.httpOptions.headers.set(
          AUTH_HEADER_KEY,
          `${AUTH_SCHEME} ${token}`
        );
        return this.handleLoginResponse(
          this.http.post<Authentication>(
            connectionUrl,
            {
              username,
              password,
            },
            {
              headers: httpHeaders,
            }
          ),
          this.isLoggedIn()
        );
      })
    );
  }

  /**
   * Sends a refresh request using current authentication to extend the
   * validity.
   */
  refreshLogin(): Observable<Authentication> {
    return this.http
      .post<Authentication>(this.buildUri(this.serviceApiUrl.refresh), {})
      .pipe(tap((a) => this.handleAuthenticationResponse(a)));
  }

  /**
   * Fetches guest authentication data withouth changing the local
   * authentication state.
   */
  fetchGuestAuthentication(): Observable<AuthenticatedUser> {
    const token = this.getGuestToken();
    const httpHeaders = this.httpOptions.headers.set(
      AUTH_HEADER_KEY,
      `${AUTH_SCHEME} ${token}`
    );
    const connectionUrl: string = this.buildUri(
      this.serviceApiUrl.login + this.serviceApiUrl.guest
    );
    return this.http.post<AuthenticatedUser>(connectionUrl, null, {
      headers: httpHeaders,
    });
  }

  getGuestToken(): string {
    return this.globalStorageService.getItem(STORAGE_KEYS.GUEST_TOKEN);
  }

  loginGuest(): Observable<ClientAuthenticationResult> {
    // Use legacy guest token as refresh token
    const guestToken = this.globalStorageService.getItem(
      STORAGE_KEYS.GUEST_TOKEN
    );
    if (guestToken) {
      this.globalStorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, guestToken);
      return this.handleLoginResponse(this.refreshLogin()).pipe(
        tap(() =>
          this.globalStorageService.removeItem(STORAGE_KEYS.GUEST_TOKEN)
        )
      );
    }
    return this.createGuestAccount();
  }

  private createGuestAccount(): Observable<ClientAuthenticationResult> {
    const token$ = this.challengeService.authenticateByChallenge();
    const loginResult$ = token$.pipe(
      switchMap((token) => {
        const httpHeaders = this.httpOptions.headers.set(
          AUTH_HEADER_KEY,
          `${AUTH_SCHEME} ${token}`
        );
        return this.handleLoginResponse(
          this.http.post<Authentication>(
            this.buildUri(this.serviceApiUrl.guest),
            {},
            {
              headers: httpHeaders,
            }
          )
        );
      })
    );

    return loginResult$;
  }

  /**
   * Open the SSO login page in a popup and check the result.
   *
   * @param providerId ID of the SSO provider
   * @param userRole User role for the UI
   */
  loginViaSso(providerId: string): Observable<ClientAuthenticationResult> {
    const ssoUrl = this.buildUri(this.serviceApiUrl.sso + '/' + providerId);
    const refreshUrl = this.buildUri(this.serviceApiUrl.refresh);
    const popup = this.openSsoPopup(ssoUrl);
    const auth$ = timer(0, 500).pipe(
      map(() => popup?.closed),
      filter((closed) => closed || false),
      concatMap(() =>
        this.http.post<Authentication>(refreshUrl, null, {
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
    const refreshUrl = this.buildUri(this.serviceApiUrl.refresh);
    const auth$ = this.http.post<Authentication>(refreshUrl, null, {
      withCredentials: true,
    });
    return this.handleLoginResponse(auth$, restoreGuestLogin);
  }

  /**
   * Resets the local authentication state.
   */
  logout() {
    this.getCurrentAuthentication().subscribe((auth) => {
      this.http
        .post(this.buildUri(this.serviceApiUrl.logout), {})
        .pipe(
          catchError((e) => {
            if (e.status === 401) {
              // 401 is expected when authentication is already expired.
              return of(undefined);
            }
            throw e;
          })
        )
        .subscribe(() => {
          this.logoutLocally();

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
    });
  }

  private logoutLocally() {
    this.globalStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.globalStorageService.removeItem(STORAGE_KEYS.USER);
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

  hasAdminRole(auth: AuthenticatedUser) {
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
   * First tries to refresh the authentication. If this fails,
   * resets the local authentication state and redirects to the login page.
   * Furthermore, the current route is stored so it can be restored after
   * login.
   */
  handleUnauthorizedError() {
    this.refreshLogin().subscribe({
      error: () => {
        this.logoutLocally();
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
      },
    });
  }

  private handleAuthenticationResponse(auth: Authentication) {
    this._accessToken.set(auth.accessToken);
    this.globalStorageService.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      auth.accessToken
    );
  }

  /**
   * Updates the local authentication state based on the server response.
   */
  private handleLoginResponse(
    clientAuthentication$: Observable<Authentication>,
    restoreGuestOnFailure?: boolean
  ): Observable<ClientAuthenticationResult> {
    const auth$ = clientAuthentication$.pipe(
      switchMap((auth) => {
        if (auth) {
          // If authenticated, transform response by fetching user, building AuthenticatedUser and wrapping it in a ClientAuthenticationResult.
          this.handleAuthenticationResponse(auth);
          return this.currentUserGql.fetch().pipe(
            map((r) => r.data?.currentUser),
            tap((u) => {
              if (!u) {
                throw new Error();
              }
            }),
            map(
              (u) =>
                new AuthenticatedUser(
                  u!.id,
                  u!.username,
                  AuthProvider.ARSNOVA,
                  auth.accessToken
                )
            ),
            tap((au) =>
              this.globalStorageService.setItem(STORAGE_KEYS.USER, au)
            ),
            map((au) => new ClientAuthenticationResult(au))
          );
        } else {
          return of(
            new ClientAuthenticationResult(
              undefined,
              AuthenticationStatus.UNKNOWN_ERROR
            )
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
        map((result) => result.authentication as AuthenticatedUser),
        tap(
          (auth) =>
            restoreGuestOnFailure &&
            !auth &&
            this.handleLoginResponse(this.refreshLogin())
        )
      )
    );

    return auth$;
  }
}
