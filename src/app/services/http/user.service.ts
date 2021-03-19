import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractEntityService } from './abstract-entity.service';
import { User } from '../../models/user';
import { AccountCreated } from '../../models/events/account-created';
import { AccountDeleted } from '../../models/events/account-deleted';
import { catchError, map, tap } from 'rxjs/operators';
import { EventService } from '../util/event.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { CachingService } from '../util/caching.service';
import { WsConnectorService } from '../websockets/ws-connector.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class UserService extends AbstractEntityService<User> {

  serviceApiUrl = {
    register: '/register',
    activate: '/activate',
    resetActivation: '/resetactivation',
    resetPassword: '/resetpassword'
  };

  constructor(private http: HttpClient,
              protected ws: WsConnectorService,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService,
              cachingService: CachingService) {
    super('User', '/user', http, ws, eventService, translateService, notificationService, cachingService);
  }

  register(email: string, password: string): Observable<boolean> {
    const connectionUrl: string = this.buildUri(this.serviceApiUrl.register);

    return this.http.post<boolean>(connectionUrl, {
      loginId: email,
      password: password
    }, httpOptions).pipe(map(() => {
      const event = new AccountCreated();
      this.eventService.broadcast(event.type);
      return true;
    }));
  }

  activate(name: string, activationKey: string): Observable<string> {
    const connectionUrl: string = this.buildUri('/~' + encodeURIComponent(name) +
      this.serviceApiUrl.activate + '?key=' + activationKey);

    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  resetActivation(username: string): Observable<User> {
    const connectionUrl: string = this.buildUri(
      '/~' + encodeURIComponent(username) +
      this.serviceApiUrl.resetActivation);
    return this.http.post<any>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<User>('resetActivation'))
    );
  }

  setNewPassword(email: string, key?: string, password?: string): Observable<boolean> {
    const connectionUrl: string = this.buildUri(
      '/~' +
      email +
      this.serviceApiUrl.resetPassword);
    let body = {};
    if (key && password) {
      body = {
        key: key,
        password: password
      };
    }
    return this.http.post(connectionUrl, body, httpOptions).pipe(map(() => {
        return true;
    }));
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

  getUserByLoginId(loginId: string): Observable<User[]> {
    const url = this.buildUri(this.apiUrl.find);
    return this.http.post<User[]>(url, {
      properties: { loginId: loginId },
      externalFilters: {}
    }).pipe(
      catchError(this.handleError('getUserId', []))
    );
  }

  getUserData(userIds: string[]): Observable<User[]> {
    const url = this.buildUri(`/?ids=${userIds}`);
    return this.http.get<User[]>(url, httpOptions).pipe(
      catchError(this.handleError('getUserData', []))
    );
  }

  addRoomToHistory(userId: string, roomId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/${userId}/roomHistory`);
    return this.http.post<void>(connectionUrl, { roomId: roomId, lastVisit: new Date().getTime() }, httpOptions);
  }

  removeRoomFromHistory(userId: string, roomId: string): Observable<void> {
    const connectionUrl = this.buildUri(`/${userId}/roomHistory/${roomId}`);
    return this.http.delete<void>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<void>('deleteRoom'))
    );
  }
}
