import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class AdminService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    room: '/room',
    user: '/user',
    activate: '/activate',
    transfer: '/transfer'
  };

  constructor(
    private http: HttpClient
  ) {
    super();
  }

  activateUser(userId: string) {
    const connectionUrl: string = `${this.apiUrl.base + this.apiUrl.user}/${userId}${this.apiUrl.activate}`;
    return this.http.post<string>(connectionUrl, {}, httpOptions);
  }

  transferRoom(roomId: string, newOwnerId: string) {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.room}/${roomId}/${this.apiUrl.transfer}?newOwnerId=${newOwnerId}`;
    return this.http.post(connectionUrl, {}, httpOptions).pipe(
      catchError(this.handleError<any>('transferRoom'))
    );
  }
}
