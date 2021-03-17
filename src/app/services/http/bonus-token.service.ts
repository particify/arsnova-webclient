import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BonusToken } from '../../models/bonus-token';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class BonusTokenService extends BaseHttpService {

  serviceApiUrl = {
    bonustoken: '/bonustoken',
    delete: '/deleteby'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  getTokensByRoomId(roomId: string): Observable<BonusToken[]> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.bonustoken + this.apiUrl.find}`;
    return this.http.post<BonusToken[]>(connectionUrl, {
      properties: {
        roomId: roomId
      }
    }).pipe(
      catchError(this.handleError<BonusToken[]>(`get bonus token by roomid = ${roomId}`))
    );
  }

  getTokensByUserId(roomId: string, userId: string): Observable<BonusToken[]> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.bonustoken + this.apiUrl.find}`;
    return this.http.post<BonusToken[]>(connectionUrl, {
      properties: {
        userId: userId
      }
    }).pipe(
      catchError(this.handleError<BonusToken[]>(`get bonus token by userId = ${userId}`))
    );
  }

  deleteToken(roomId: string, commentId: string, userId: string) {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.bonustoken + this.serviceApiUrl.delete}`
      + `?roomid=${roomId}&commentid=${commentId}&userid=${userId}`;
    return this.http.delete<BonusToken>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<BonusToken>('deleteToken'))
    );
  }

  deleteTokensByRoomId(roomId: string) {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.bonustoken + this.serviceApiUrl.delete}?roomid=${roomId}`;
    return this.http.delete<BonusToken>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<BonusToken>('deleteToken'))
    );
  }
}
