import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
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
export class AdminService extends BaseHttpService {

  serviceApiUrl = {
    adminView: 'view=admin',
    transfer: '/transfer',
    activate: '/activate'
  };

  constructor(
    private http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected userService: UserService) {
    super('', eventService, translateService, notificationService);
  }

  getUser(id: string) {
    const connectionUrl = this.buildUri(`/${id}?${this.serviceApiUrl.adminView}`);
    return this.http.get<User>(connectionUrl);
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = this.buildUri(`?${this.serviceApiUrl.adminView}`, id);
    return this.http.get<Room>(connectionUrl);
  }

  activateUser(userId: string) {
    const connectionUrl = this.userService.buildUri(`/${userId}${this.serviceApiUrl.activate}`);
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = this.userService.buildUri(`/${this.serviceApiUrl.transfer}?newOwnerId=${newOwnerId}`, roomId);
    return this.http.post(connectionUrl, {}, httpOptions).pipe(
      catchError(this.handleError<any>('transferRoom'))
    );
  }
}
