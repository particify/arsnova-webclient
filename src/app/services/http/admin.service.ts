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

  serviceApiUrl = {
    adminView: 'view=admin',
    transfer: '/transfer',
    activate: '/activate'
  };

  constructor(
    private http: HttpClient,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getUser(id: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${id}?${this.serviceApiUrl.adminView}`;
    return this.http.get<User>(connectionUrl);
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = `${this.getBaseUrl(id)}?${this.serviceApiUrl.adminView}`;
    return this.http.get<Room>(connectionUrl);
  }

  activateUser(userId: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${userId}${this.serviceApiUrl.activate}`;
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = `${this.getBaseUrl(roomId)}/${this.serviceApiUrl.transfer}?newOwnerId=${newOwnerId}`;
    return this.http.post(connectionUrl, {}, httpOptions).pipe(
      catchError(this.handleError<any>('transferRoom'))
    );
  }
}
