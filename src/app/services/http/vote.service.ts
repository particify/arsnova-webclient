import { Injectable } from '@angular/core';
import { Vote } from '../../models/vote';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class VoteService extends BaseHttpService {
  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super('/vote', eventService, translateService, notificationService);
  }

  add(roomId: string, vote: Vote): Observable<Vote> {
    const connectionUrl = this.buildUri('/', roomId);
    return this.http.post<Vote>(connectionUrl, vote, httpOptions).pipe(
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
    const connectionUrl = this.buildUri(`/${commentId}/${userId}`, roomId);
    return this.http.delete<Vote>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Vote>('delete Vote'))
    );
  }

  getByRoomIdAndUserID(roomId: string, userId: string): Observable<Vote[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Vote[]>(connectionUrl, {
      properties: {
        userId: userId
      },
      externalFilters: {
        roomId: roomId
      }
    }).pipe(
      catchError(this.handleError<Vote[]>(`get votes by roomid = ${roomId}`))
    );
  }
}
