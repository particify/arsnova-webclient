import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, concatMap, filter, map, take, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';
import { User } from '../../models/user';
import { UserRole } from '../../models/user-roles.enum';
import { EventService } from '../util/event.service';
import { ClientAuthentication } from '../../models/client-authentication';
import * as JwtDecode from 'jwt-decode';

@Injectable()
export class AuthenticationService extends BaseHttpService {
  private readonly ADMIN_ROLE: string = 'ADMIN';
  private user = new BehaviorSubject<User>(undefined);
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
    private http: HttpClient
  ) {
    super();
  }

  /*
   * Three possible return values:
   * - "true": login successful
   * - "false": login failed
   * - "activation": account exists but needs activation with key
   */
  login(email: string, password: string, userRole: UserRole): Observable<string> {
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.registered;

    return this.checkLogin(this.http.post<ClientAuthentication>(connectionUrl, {
      loginId: email,
      password: password
    }, this.httpOptions), userRole, false);
  }

  refreshLogin(): void {
    const savedUser = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      // Load user data from local data store if available
      const user: User = savedUser;
      // ToDo: Fix this madness.
      const wasGuest = (user.authProvider === 'ARSNOVA_GUEST') ? true : false;
      const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + '?refresh=true';
      this.setUser(new User(
        user.id,
        user.loginId,
        user.authProvider,
        user.token,
        user.role,
        wasGuest
      ));
      this.http.post<ClientAuthentication>(connectionUrl, {}, this.httpOptions).pipe(
        tap(_ => ''),
        catchError(e => {
          if (e.status === 401 || e.status === 403) {
            this.globalStorageService.removeItem(STORAGE_KEYS.USER);
          }
          return of(null);
        })
      ).subscribe(nu => {
        if (nu) {
          this.setUser(new User(
            nu.userId,
            nu.loginId,
            nu.authProvider,
            nu.token,
            user.role,
            wasGuest));
        } else {
          this.logout();
        }
      });
    }
  }

  guestLogin(userRole: UserRole): Observable<string> {
    let wasGuest = false;
    const savedUser = this.globalStorageService.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      wasGuest = savedUser;
    }
    if (wasGuest) {
      this.refreshLogin();
    }
    if (!this.isLoggedIn()) {
      const connectionUrl: string = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + this.apiUrl.guest;

      return this.checkLogin(this.http.post<ClientAuthentication>(connectionUrl, null, this.httpOptions), userRole, true);
    } else {
      return of('true');
    }
  }

  /**
   * Open the SSO login page in a popup and check the result.
   *
   * @param providerId ID of the SSO provider
   * @param userRole User role for the UI
   */
  loginViaSso(providerId: string, userRole: UserRole): Observable<string> {
    const ssoUrl = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.sso + '/' + providerId;
    const loginUrl = this.apiUrl.base + this.apiUrl.auth + this.apiUrl.login + '?refresh=true';
    const popupW = 500;
    const popupH = 500;
    const popupX = window.top.screenX + window.top.outerWidth / 2 - popupW / 2;
    const popupY = window.top.screenY + window.top.outerHeight / 2 - popupH / 2;
    const popup = window.open(ssoUrl, 'auth_popup',
      `left=${popupX},top=${popupY},width=${popupW},height=${popupH},resizable`);
    const auth = timer(0, 500).pipe(
      map(() => popup.closed),
      filter((closed) => closed),
      concatMap(() => this.http.post<ClientAuthentication>(loginUrl, null, { withCredentials: true })),
      take(1));

    return this.checkLogin(auth, userRole, false);
  }

  logout() {
    // Destroy the persisted user data
    // Actually don't destroy it because we want to preserve guest accounts in local storage
    // this.dataStoreService.remove(this.STORAGE_KEY);
    this.globalStorageService.removeItem(STORAGE_KEYS.LOGGED_IN);
    this.user.next(undefined);
  }

  getUser(): User {
    return this.user.getValue();
  }

  private setUser(user: User): void {
    this.globalStorageService.setItem(STORAGE_KEYS.USER, user);
    this.globalStorageService.setItem(STORAGE_KEYS.LOGGED_IN, true);
    this.user.next(user);
  }

  isAdmin(): boolean {
    const currentUser = this.user.getValue();
    if (currentUser) {
      const decodedToken = JwtDecode(currentUser.token);
      if (decodedToken.roles.some(role => role === this.ADMIN_ROLE)) {
        return true;
      }
    }

    return false;
  }

  isLoggedIn(): boolean {
    return this.user.getValue() !== undefined;
  }

  getToken(): string {
    return this.isLoggedIn() ? this.user.getValue().token : undefined;
  }

  private checkLogin(clientAuthentication: Observable<ClientAuthentication>, userRole: UserRole, isGuest: boolean): Observable<string> {
    return clientAuthentication.pipe(map(result => {
      if (result) {
        // ToDo: Fix this madness.
        isGuest = result.authProvider === 'ARSNOVA_GUEST' ? true : false;
        this.setUser(new User(
          result.userId,
          result.loginId,
          result.authProvider,
          result.token,
          userRole,
          isGuest));
        this.globalStorageService.setItem(STORAGE_KEYS.LOGGED_IN, true);
        return 'true';
      } else {
        return 'false';
      }
    }), catchError((e) => {
      // check if user needs activation
      if (e.error.errorType === 'DisabledException') {
        return of('activation');
      }
      return of('false');
    }));
  }

  get watchUser() {
    return this.user.asObservable();
  }

  getUserAsSubject(): BehaviorSubject<User> {
    return this.user;
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
