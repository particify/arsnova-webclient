import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { Observable } from 'rxjs';
import { Room } from '../../models/room';
import { User } from '../../models/user';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { UserService } from './user.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class AdminService extends AbstractHttpService<void> {

  serviceApiUrl = {
    adminView: 'view=admin',
    user: '/user',
    transfer: '/transfer',
    activate: '/activate'
  };

  constructor(
    private http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected userService: UserService) {
    super('', http, eventService, translateService, notificationService);
  }

  getUser(id: string) {
    const connectionUrl = this.buildForeignUri(`${this.serviceApiUrl.user}/${id}?${this.serviceApiUrl.adminView}`);
    return this.http.get<User>(connectionUrl);
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = this.buildForeignUri(`?${this.serviceApiUrl.adminView}`, id);
    return this.http.get<Room>(connectionUrl);
  }

  activateUser(userId: string) {
    const connectionUrl = this.userService.buildForeignUri(`${this.serviceApiUrl.user}/${userId}${this.serviceApiUrl.activate}`);
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = this.userService.buildForeignUri(`/${this.serviceApiUrl.transfer}?newOwnerId=${newOwnerId}`, roomId);
    return this.http.post(connectionUrl, {}, httpOptions).pipe(
      catchError(this.handleError<any>('transferRoom'))
    );
  }
}
