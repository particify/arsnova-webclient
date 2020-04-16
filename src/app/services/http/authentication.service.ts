import { catchError, concatMap, filter, map, take, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { User } from '../../models/user';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { UserRole } from '../../models/user-roles.enum';
import { EventService } from '../util/event.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClientAuthentication } from '../../models/client-authentication';
import { BaseHttpService } from './base-http.service';
import { GlobalStorageService, LocalStorageKey } from '../util/global-storage.service';

@Injectable()
export class AuthenticationService extends BaseHttpService {
  private readonly STORAGE_KEY: string = 'USER';
  private readonly ROOM_ACCESS: string = 'ROOM_ACCESS';
  private user = new BehaviorSubject<User>(undefined);
  private apiUrl = {
    base: '/api',
    v2: '/api/v2',
    auth: '/auth',
    login: '/login',
    user: '/user',
    register: '/register',
    registered: '/registered',
    resetPassword: '/resetpassword',
    guest: '/guest',
    sso: '/sso'
  };
  private httpOptions = {
    headers: new HttpHeaders({})
  };

  private roomAccess = new Map();
  private redirect: string;

  constructor(
    private globalStorageService: GlobalStorageService,
    public eventService: EventService,
    private http: HttpClient
  ) {
    super();
    const storedAccess = this.globalStorageService.getLocalStorageItem(LocalStorageKey.ROOM_ACCESS);
    if (storedAccess) {
      for (const cA of storedAccess) {
        let role = UserRole.PARTICIPANT;
        const roleAsNumber: string = cA.substring(0, 1);
        const shortId: string = cA.substring(2);
        if (roleAsNumber === '3') {
          role = UserRole.CREATOR;
        } else if (roleAsNumber === '2') {
          role = UserRole.EXECUTIVE_MODERATOR;
        }
        this.roomAccess.set(shortId, role);
      }
    }
    this.eventService.on<any>('RoomJoined').subscribe(payload => {
      this.roomAccess.set(payload.id, UserRole.PARTICIPANT);
      this.saveAccessToLocalStorage();
    });
    this.eventService.on<any>('RoomDeleted').subscribe(payload => {
      this.roomAccess.delete(payload.id);
      this.saveAccessToLocalStorage();
    });
    this.eventService.on<any>('RoomCreated').subscribe(payload => {
      this.roomAccess.set(payload.id, UserRole.CREATOR);
      this.saveAccessToLocalStorage();
    });
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
    const savedUser = this.globalStorageService.getLocalStorageItem(LocalStorageKey.USER);
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
        catchError(_ => {
          this.globalStorageService.deleteLocalStorageItem(LocalStorageKey.USER);
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
    const savedUser = this.globalStorageService.getLocalStorageItem(LocalStorageKey.USER);
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

  register(email: string, password: string): Observable<boolean> {
    const connectionUrl: string = this.apiUrl.base + this.apiUrl.user + this.apiUrl.register;

    return this.http.post<boolean>(connectionUrl, {
      loginId: email,
      password: password
    }, this.httpOptions).pipe(map(() => {
      return true;
    }));
  }

  resetPassword(email: string): Observable<boolean> {
    const connectionUrl: string =
      this.apiUrl.v2 +
      this.apiUrl.user +
      '/' +
      email +
      this.apiUrl.resetPassword;

    return this.http.post(connectionUrl, {
      key: null,
      password: null
    }, this.httpOptions).pipe(
      catchError(err => {
        return of(false);
      }), map((result) => {
        return true;
      })
    );
  }

  setNewPassword(email: string, key: string, password: string): Observable<boolean> {
    const connectionUrl: string =
      this.apiUrl.v2 +
      this.apiUrl.user +
      '/' +
      email +
      this.apiUrl.resetPassword +
      `?key=${key}&password=${password}`;

    return this.http.post(connectionUrl, {}, this.httpOptions).pipe(
      catchError(err => {
        return of(false);
      }), map((result) => {
        return true;
      })
    );
  }

  logout() {
    // Destroy the persisted user data
    // Actually don't destroy it because we want to preserve guest accounts in local storage
    // this.dataStoreService.remove(this.STORAGE_KEY);
    this.globalStorageService.deleteLocalStorageItem(LocalStorageKey.LOGGED_IN);
    this.user.next(undefined);
  }

  getUser(): User {
    return this.user.getValue();
  }

  private setUser(user: User): void {
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.USER, user);
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.LOGGED_IN, 'true');
    this.user.next(user);
  }

  isLoggedIn(): boolean {
    return this.user.getValue() !== undefined;
  }

  assignRole(role: UserRole): void {
    const u = this.user.getValue();
    u.role = role;
    this.setUser(u);
  }

  getRole(): UserRole {
    return this.isLoggedIn() ? this.user.getValue().role : undefined;
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
        this.globalStorageService.setLocalStorageItem(LocalStorageKey.LOGGED_IN, 'true');
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

  hasAccess(shortId: string, role: UserRole): boolean {
    const usersRole = this.roomAccess.get(shortId);
    return (usersRole !== undefined && (usersRole >= role));
  }

  setAccess(shortId: string, role: UserRole): void {
    this.roomAccess.set(shortId, role);
    this.saveAccessToLocalStorage();
  }

  checkAccess(shortId: string): void {
    if (this.hasAccess(shortId, UserRole.CREATOR)) {
      this.assignRole(UserRole.CREATOR);
    } else if (this.hasAccess(shortId, UserRole.EXECUTIVE_MODERATOR)) {
      this.assignRole(UserRole.EXECUTIVE_MODERATOR);
    } else if (this.hasAccess(shortId, UserRole.PARTICIPANT)) {
      this.assignRole(UserRole.PARTICIPANT);
    }
  }

  saveAccessToLocalStorage(): void {
    const arr = [];
    this.roomAccess.forEach(function (key, value) {
      arr.push(key + '_' + String(value));
    });
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.ROOM_ACCESS, arr);
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
