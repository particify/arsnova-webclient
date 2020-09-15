import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment';
import { catchError, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TSMap } from 'typescript-map';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CommentService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    comment: '/comment',
    find: '/find',
    count: '/count',
    command: '/_command',
    highlight: '/highlight',
    lowlight: '/lowlight'
  };

  constructor(private http: HttpClient,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getComment(commentId: string, roomId: string): Observable<Comment> {
    const connectionUrl = `${this.apiUrl.base}/${roomId}${this.apiUrl.comment}/${commentId}`;
    return this.http.get<Comment>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment>('getComment'))
    );
  }

  addComment(comment: Comment): Observable<Comment> {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/';
    return this.http.post<Comment>(connectionUrl, comment, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment>('addComment'))
    );
  }

  deleteComment(comment: Comment): Observable<Comment> {
    const connectionUrl = `${this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment}/${comment.id}`;
    return this.http.delete<Comment>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment>('deleteComment'))
    );
  }

  getAckComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.apiUrl.base + '/' + roomId + this.apiUrl.comment + this.apiUrl.find;
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId, ack: true },
      externalFilters: {}
    }, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  getRejectedComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.apiUrl.base + '/' + roomId + this.apiUrl.comment + this.apiUrl.find;
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId, ack: false },
      externalFilters: {}
    }, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  getComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.apiUrl.base + '/' + roomId + this.apiUrl.comment + this.apiUrl.find;
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId },
      externalFilters: {}
    }, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  updateComment(comment: Comment): Observable<any> {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/' + comment.id;
    return this.http.put(connectionUrl, comment, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateComment'))
    );
  }

  deleteCommentsByRoomId(roomId: string): Observable<Comment> {
    const connectionUrl = `${this.apiUrl.base + '/' + roomId + this.apiUrl.comment}/byRoom?roomId=${roomId}`;
    return this.http.delete<Comment>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Comment>('deleteComment'))
    );
  }

  countByRoomId(roomId: string, ack: boolean): Observable<number> {
    const connectionUrl = this.apiUrl.base + '/' + roomId + this.apiUrl.comment + this.apiUrl.find + this.apiUrl.count;
    return this.http.post<number>(connectionUrl, {
      properties: { roomId: roomId, ack: ack },
      externalFilters: {}
    }, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<number>('countByRoomId', 0))
    );
  }

  answer(comment: Comment, answer: string): Observable<Comment> {
    comment.answer = answer;
    const changes = new TSMap<string, any>();
    changes.set('answer', comment.answer);
    return this.patchComment(comment, changes);
  }

  toggleRead(comment: Comment): Observable<Comment> {
    comment.read = !comment.read;
    const changes = new TSMap<string, any>();
    changes.set('read', comment.read);
    return this.patchComment(comment, changes);
  }

  toggleFavorite(comment: Comment): Observable<Comment> {
    comment.favorite = !comment.favorite;
    const changes = new TSMap<string, any>();
    changes.set('favorite', comment.favorite);
    return this.patchComment(comment, changes);
  }

  markCorrect(comment: Comment): Observable<Comment> {
    const changes = new TSMap<string, any>();
    changes.set('correct', comment.correct);
    return this.patchComment(comment, changes);
  }

  toggleAck(comment: Comment): Observable<Comment> {
    comment.ack = !comment.ack;
    const changes = new TSMap<string, any>();
    changes.set('ack', comment.ack);
    return this.patchComment(comment, changes);
  }

  private patchComment(comment: Comment, changes: TSMap<string, any>): Observable<Comment> {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/' + comment.id;
    return this.http.patch(connectionUrl, changes, httpOptions).pipe(
      catchError(this.handleError<any>('patchComment'))
    );
  }

  highlight(comment: Comment): Observable<void> {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/' + comment.id +
        this.apiUrl.command + this.apiUrl.highlight;
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

  lowlight(comment: Comment): Observable<void> {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/' + comment.id +
        this.apiUrl.command + this.apiUrl.lowlight;
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

}
