import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { Observable } from 'rxjs';
import { Room } from '@app/core/models/room';
import { User } from '@app/core/models/user';
import { UserService } from './user.service';
import { AuthProvider } from '@app/core/models/auth-provider';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class AdminService extends AbstractHttpService<void> {
  protected userService = inject(UserService);

  serviceApiUrl = {
    adminView: 'view=admin',
    user: '/user',
    transfer: '/transfer',
    activate: '/activate',
  };

  constructor() {
    super('');
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
