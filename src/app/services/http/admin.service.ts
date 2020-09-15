import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { Observable } from 'rxjs';
import { Room } from '../../models/room';
import { User } from '../../models/user';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class AdminService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    adminView: 'view=admin',
    room: '/room',
    user: '/user',
    activate: '/activate',
    transfer: '/transfer'
  };

  constructor(
    private http: HttpClient,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getUser(id: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${id}?${this.apiUrl.adminView}`;
    return this.http.get<User>(connectionUrl);
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.room}/${id}?${this.apiUrl.adminView}`;
    return this.http.get<Room>(connectionUrl);
  }

  activateUser(userId: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${userId}${this.apiUrl.activate}`;
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.room}/${roomId}/${this.apiUrl.transfer}?newOwnerId=${newOwnerId}`;
    return this.http.post(connectionUrl, {}, httpOptions).pipe(
      catchError(this.handleError<any>('transferRoom'))
    );
  }
}
