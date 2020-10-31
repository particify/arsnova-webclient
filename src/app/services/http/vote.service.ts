import { Injectable } from '@angular/core';
import { Vote } from '../../models/vote';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class VoteService extends BaseHttpService {

  serviceApiUrl = {
    vote: '/vote'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  add(roomId: string, vote: Vote): Observable<Vote> {
    const connectionUrl = this.getBaseUrl(roomId) + this.serviceApiUrl.vote + '/';
    return this.http.post<Vote>(connectionUrl, vote, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Vote>('add vote'))
    );
  }

  voteUp(roomId: string, commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, 1);
    return this.add(roomId, v);
  }

  voteDown(roomId: string, commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, -1);
    return this.add(roomId, v);
  }

  deleteVote(roomId: string, commentId: string, userId: string): Observable<Vote> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.vote}/${commentId}/${userId}`;
    return this.http.delete<Vote>(connectionUrl, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<Vote>('delete Vote'))
    );
  }

  getByRoomIdAndUserID(roomId: string, userId: string): Observable<Vote[]> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.vote + this.apiUrl.find}`;
    return this.http.post<Vote[]>(connectionUrl, {
      properties: {
        userId: userId
      },
      externalFilters: {
        roomId: roomId
      }
    }).pipe(
      tap(() => ''),
      catchError(this.handleError<Vote[]>(`get votes by roomid = ${roomId}`))
    );
  }
}
