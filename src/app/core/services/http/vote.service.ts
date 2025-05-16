import { Injectable } from '@angular/core';
import { Vote } from '@app/core/models/vote';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class VoteService extends AbstractHttpService<Vote> {
  constructor() {
    super('/vote');
  }

  add(roomId: string, vote: Vote): Observable<Vote> {
    const connectionUrl = this.buildUri('/', roomId);
    return this.http
      .post<Vote>(connectionUrl, vote, httpOptions)
      .pipe(catchError(this.handleError<Vote>('add vote')));
  }

  voteUp(roomId: string, commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, 1);
    return this.add(roomId, v);
  }

  voteDown(roomId: string, commentId: string, userId: string) {
    const v: Vote = new Vote(userId, commentId, -1);
    return this.add(roomId, v);
  }

  deleteVote(
    roomId: string,
    commentId: string,
    userId: string
  ): Observable<Vote> {
    const connectionUrl = this.buildUri(`/${commentId}/${userId}`, roomId);
    return this.http
      .delete<Vote>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Vote>('delete Vote')));
  }

  getByRoomIdAndUserID(roomId: string, userId: string): Observable<Vote[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http
      .post<Vote[]>(connectionUrl, {
        properties: {
          userId: userId,
        },
        externalFilters: {
          roomId: roomId,
        },
      })
      .pipe(
        catchError(this.handleError<Vote[]>(`get votes by roomid = ${roomId}`))
      );
  }
}
