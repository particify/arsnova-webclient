import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { Observable } from 'rxjs';
import { Room } from '@app/core/models/room';
import { User } from '@app/core/models/user';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { UserService } from './user.service';
import { AuthProvider } from '@app/core/models/auth-provider';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class AdminService extends AbstractHttpService<void> {
  serviceApiUrl = {
    adminView: 'view=admin',
    user: '/user',
    transfer: '/transfer',
    activate: '/activate',
  };

  constructor(
    private http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    protected userService: UserService
  ) {
    super('', http, eventService, translateService, notificationService);
  }

  getUser(id: string) {
    const connectionUrl = this.buildForeignUri(
      `${this.serviceApiUrl.user}/${id}?${this.serviceApiUrl.adminView}`
    );
    return this.http.get<User>(connectionUrl);
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = this.buildForeignUri(
      `?${this.serviceApiUrl.adminView}`,
      id
    );
    return this.http.get<Room>(connectionUrl);
  }

  activateUser(userId: string) {
    const connectionUrl = this.userService.buildForeignUri(
      `${this.serviceApiUrl.user}/${userId}${this.serviceApiUrl.activate}`
    );
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = this.userService.buildForeignUri(
      `/${this.serviceApiUrl.transfer}?newOwnerId=${newOwnerId}`,
      roomId
    );
    return this.http
      .post(connectionUrl, {}, httpOptions)
      .pipe(catchError(this.handleError<any>('transferRoom')));
  }

  addAccount(loginId: string) {
    const connectionUrl = this.userService.buildUri('/');
    const body = {
      loginId: loginId,
      authProvider: AuthProvider.ARSNOVA,
    };
    return this.http
      .post<User>(connectionUrl, body, httpOptions)
      .pipe(catchError(this.handleError<User>('addAccount')));
  }
}
