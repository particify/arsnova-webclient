import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment';
import { catchError, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TSMap } from 'typescript-map';

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

  constructor(private http: HttpClient) {
    super();
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
    //const connectionUrl = this.apiUrl.base + this.apiUrl.comment + '/' + roomId + this.apiUrl.find;
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

  answer(comment: Comment, answer: string): Comment {
    comment.answer = answer;
    const changes = new TSMap<string, any>();
    changes.set('answer', comment.answer);
    this.patchComment(comment, changes);
    return comment;
  }

  toggleRead(comment: Comment): Comment {
    comment.read = !comment.read;
    const changes = new TSMap<string, any>();
    changes.set('read', comment.read);
    this.patchComment(comment, changes);
    return comment;
  }

  toggleFavorite(comment: Comment): Comment {
    comment.favorite = !comment.favorite;
    const changes = new TSMap<string, any>();
    changes.set('favorite', comment.favorite);
    this.patchComment(comment, changes);
    return comment;
  }

  markCorrect(comment: Comment): Comment {
    const changes = new TSMap<string, any>();
    changes.set('correct', comment.correct);
    this.patchComment(comment, changes);
    return comment;
  }

  toggleAck(comment: Comment): Comment {
    comment.ack = !comment.ack;
    const changes = new TSMap<string, any>();
    changes.set('ack', comment.ack);
    this.patchComment(comment, changes);
    return comment;
  }

  private patchComment(comment: Comment, changes: TSMap<string, any>): void {
    const connectionUrl = this.apiUrl.base + '/' + comment.roomId + this.apiUrl.comment + '/' + comment.id;
    this.http.patch(connectionUrl, changes, httpOptions).subscribe();
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
