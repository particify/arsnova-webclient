import { Injectable } from '@angular/core';
import { Vote } from '../../models/vote';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class VoteService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    vote: '/vote',
    find: '/find'
  };

  constructor(private http: HttpClient,
              private authService: AuthenticationService,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  add(vote: Vote): Observable<Vote> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.vote + '/';
    return this.http.post<Vote>(connectionUrl, vote, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Vote>('add vote'))
    );
  }

  voteUp(commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, 1);
    return this.add(v);
  }

  voteDown(commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, -1);
    return this.add(v);
  }

  deleteVote(commentId: string, userId: string): Observable<Vote> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.vote}/${commentId}/${userId}`;
    return this.http.delete<Vote>(connectionUrl, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<Vote>('delete Vote'))
    );
  }

  getByRoomIdAndUserID(roomId: string, userId: string): Observable<Vote[]> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.vote + this.apiUrl.find}`;
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
