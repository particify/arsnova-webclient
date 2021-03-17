import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment';
import { catchError, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { CommentCreated } from '../../models/events/comment-created';
import { CachingService } from '../util/caching.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CommentService extends AbstractEntityService<Comment> {

  serviceApiUrl = {
    highlight: '/highlight',
    lowlight: '/lowlight',
    command: '/_command',
    count: '/count'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService,
              cachingService: CachingService) {
    super('/comment', http, eventService, translateService, notificationService, cachingService);
  }

  getComment(commentId: string, roomId: string): Observable<Comment> {
    const connectionUrl = this.buildUri(`/${commentId}`, roomId);
    return this.http.get<Comment>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Comment>('getComment'))
    );
  }

  addComment(comment: Comment): Observable<Comment> {
    const connectionUrl = this.buildUri('/', comment.roomId);
    return this.http.post<Comment>(connectionUrl, comment, httpOptions).pipe(
      tap(() => {
        const event = new CommentCreated();
        this.eventService.broadcast(event.type);
      }),
      catchError(this.handleError<Comment>('addComment'))
    );
  }

  deleteComment(comment: Comment): Observable<Comment> {
    const connectionUrl = this.buildUri(`/${comment.id}`, comment.roomId);
    return this.http.delete<Comment>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Comment>('deleteComment'))
    );
  }

  getAckComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId, ack: true },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  getRejectedComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId, ack: false },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  getComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http.post<Comment[]>(connectionUrl, {
      properties: { roomId: roomId },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError<Comment[]>('getComments', []))
    );
  }

  updateComment(comment: Comment): Observable<any> {
    const connectionUrl = this.buildUri(`/${comment.id}`, comment.roomId);
    return this.http.put(connectionUrl, comment, httpOptions).pipe(
      catchError(this.handleError<any>('updateComment'))
    );
  }

  deleteCommentsByRoomId(roomId: string): Observable<Comment> {
    const connectionUrl = this.buildUri(`/byRoom?roomId=${roomId}`, roomId);
    return this.http.delete<Comment>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Comment>('deleteComment'))
    );
  }

  countByRoomId(roomId: string, ack: boolean): Observable<number> {
    const connectionUrl = this.buildUri(`${this.apiUrl.find + this.serviceApiUrl.count}`, roomId);
    return this.http.post<number>(connectionUrl, {
      properties: { roomId: roomId, ack: ack },
      externalFilters: {}
    }, httpOptions).pipe(
      catchError(this.handleError<number>('countByRoomId', 0))
    );
  }

  answer(comment: Comment, answer: string): Observable<Comment> {
    comment.answer = answer;
    const changes: { answer: string } = { answer: comment.answer };
    return this.patchComment(comment, changes);
  }

  toggleRead(comment: Comment): Observable<Comment> {
    comment.read = !comment.read;
    const changes: { read: boolean } = { read: comment.read };
    return this.patchComment(comment, changes);
  }

  toggleFavorite(comment: Comment): Observable<Comment> {
    comment.favorite = !comment.favorite;
    const changes: { favorite: boolean } = { favorite: comment.favorite };
    return this.patchComment(comment, changes);
  }

  markCorrect(comment: Comment): Observable<Comment> {
    const changes: { correct: number } = { correct: comment.correct };
    return this.patchComment(comment, changes);
  }

  toggleAck(comment: Comment): Observable<Comment> {
    comment.ack = !comment.ack;
    const changes: { ack: boolean } = { ack: comment.ack };
    return this.patchComment(comment, changes);
  }

  private patchComment(comment: Comment, changes: object): Observable<Comment> {
    const connectionUrl = this.buildUri(`/${comment.id}`, comment.roomId);
    return this.http.patch(connectionUrl, changes, httpOptions).pipe(
      catchError(this.handleError<any>('patchComment'))
    );
  }

  highlight(comment: Comment): Observable<void> {
    const connectionUrl = this.buildUri(`/${comment.id +
        this.serviceApiUrl.command + this.serviceApiUrl.highlight}`, comment.roomId);
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

  lowlight(comment: Comment): Observable<void> {
    const connectionUrl = this.buildUri(`/${comment.id +
        this.serviceApiUrl.command + this.serviceApiUrl.lowlight}`, comment.roomId);
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

}
