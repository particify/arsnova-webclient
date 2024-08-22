import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractEntityService } from './abstract-entity.service';
import { User } from '@app/core/models/user';
import { AccountCreated } from '@app/core/models/events/account-created';
import { AccountDeleted } from '@app/core/models/events/account-deleted';
import { catchError, map, tap } from 'rxjs/operators';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CachingService } from '@app/core/services/util/caching.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { UserSettings } from '@app/core/models/user-settings';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class UserService extends AbstractEntityService<User> {
  serviceApiUrl = {
    register: '/register',
    activate: '/activate',
    resetActivation: '/resetactivation',
    resetPassword: '/resetpassword',
  };

  constructor(
    private http: HttpClient,
    protected ws: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    cachingService: CachingService
  ) {
    super(
      'User',
      '/user',
      http,
      ws,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }

  register(email: string, password: string): Observable<boolean> {
    const connectionUrl: string = this.buildUri(this.serviceApiUrl.register);

    return this.http
      .post<boolean>(
        connectionUrl,
        {
          loginId: email,
          password: password,
        },
        httpOptions
      )
      .pipe(
        map(() => {
          const event = new AccountCreated();
          this.eventService.broadcast(event.type);
          return true;
        })
      );
  }

  activate(name: string, activationKey: string): Observable<string> {
    const connectionUrl: string = this.buildUri(
      '/~' +
        encodeURIComponent(name) +
        this.serviceApiUrl.activate +
        '?key=' +
        activationKey
    );

    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  resetActivation(username: string): Observable<User> {
    const connectionUrl: string = this.buildUri(
      '/~' + encodeURIComponent(username) + this.serviceApiUrl.resetActivation
    );
    return this.http
      .post<any>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<User>('resetActivation')));
  }

  setNewPassword(
    email: string,
    key?: string,
    password?: string
  ): Observable<boolean> {
    const connectionUrl: string = this.buildUri(
      '/~' + email + this.serviceApiUrl.resetPassword
    );
    let body = {};
    if (key && password) {
      body = {
        key: key,
        password: password,
      };
    }
    return this.http.post(connectionUrl, body, httpOptions).pipe(
      map(() => {
        return true;
      })
    );
  }

  updateUser(userId: string, changes: object): Observable<User> {
    const connectionUrl = this.buildUri('/' + userId) + '?view=owner';
    return this.http
      .patch<User>(connectionUrl, changes, httpOptions)
      .pipe(catchError(this.handleError<User>('updateUser')));
  }

  delete(id: string): Observable<User> {
    const connectionUrl: string = this.buildUri('/' + id);
    return this.http.delete<User>(connectionUrl, httpOptions).pipe(
      tap(() => {
        const event = new AccountDeleted();
        this.eventService.broadcast(event.type);
      }),
      catchError(this.handleError<User>('deleteUser'))
    );
  }

  getUserByDisplayId(displayId: string, extended = false): Observable<User[]> {
    const url =
      this.buildUri(this.apiUrl.find) + (extended ? '?view=owner' : '');
    return this.http
      .post<User[]>(url, {
        properties: { person: { displayId: displayId } },
        externalFilters: {},
      })
      .pipe(catchError(this.handleError('getUserId', [])));
  }

  getUserSettingsByLoginId(loginId: string): Observable<UserSettings> {
    const url = this.buildUri(this.apiUrl.find) + '?view=owner';
    return this.http
      .post<User[]>(url, {
        properties: { loginId: loginId },
        externalFilters: {},
      })
      .pipe(
        map((users) => {
          return users[0].settings;
        }),
        catchError(this.handleError<UserSettings>('getUserSettingsByLoginId'))
      );
  }

  getUserData(userIds: string[]): Observable<User[]> {
    const url = this.buildUri(`/?ids=${userIds}`);
    return this.http
      .get<User[]>(url, httpOptions)
      .pipe(catchError(this.handleError('getUserData', [])));
  }
}
