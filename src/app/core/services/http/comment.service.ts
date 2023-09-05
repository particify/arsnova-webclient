import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '@app/core/models/comment';
import { catchError, take, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { CommentCreated } from '@app/core/models/events/comment-created';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Room } from '@app/core/models/room';
import { CachingService } from '@app/core/services/util/caching.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { Message } from '@stomp/stompjs';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { CorrectWrong } from '@app/core/models/correct-wrong.enum';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { CommentPeriod } from '@app/core/models/comment-period.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class CommentService extends AbstractEntityService<Comment> {
  serviceApiUrl = {
    highlight: '/highlight',
    lowlight: '/lowlight',
    command: '/_command',
    count: '/count',
  };

  constructor(
    private http: HttpClient,
    protected ws: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    cachingService: CachingService,
    protected wsCommentService: WsCommentService
  ) {
    super(
      'Comment',
      '/comment',
      http,
      ws,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }

  getComment(commentId: string, roomId: string): Observable<Comment> {
    const connectionUrl = this.buildUri(`/${commentId}`, roomId);
    return this.http
      .get<Comment>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Comment>('getComment')));
  }

  addComment(comment: Comment): Observable<Comment> {
    const connectionUrl = this.buildUri('/', comment.roomId);
    return this.requestOnce('POST', connectionUrl, comment, httpOptions).pipe(
      tap(() => {
        const event = new CommentCreated();
        this.eventService.broadcast(event.type);
      }),
      catchError(this.handleError<Comment>('addComment'))
    );
  }

  deleteComment(comment: Comment): Observable<Comment> {
    const connectionUrl = this.buildUri(`/${comment.id}`, comment.roomId);
    return this.http
      .delete<Comment>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Comment>('deleteComment')));
  }

  getAckComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http
      .post<Comment[]>(
        connectionUrl,
        {
          properties: { roomId: roomId, ack: true },
          externalFilters: {},
        },
        httpOptions
      )
      .pipe(catchError(this.handleError<Comment[]>('getComments', [])));
  }

  getRejectedComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http
      .post<Comment[]>(
        connectionUrl,
        {
          properties: { roomId: roomId, ack: false },
          externalFilters: {},
        },
        httpOptions
      )
      .pipe(catchError(this.handleError<Comment[]>('getComments', [])));
  }

  getComments(roomId: string): Observable<Comment[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find, roomId);
    return this.http
      .post<Comment[]>(
        connectionUrl,
        {
          properties: { roomId: roomId },
          externalFilters: {},
        },
        httpOptions
      )
      .pipe(catchError(this.handleError<Comment[]>('getComments', [])));
  }

  updateComment(comment: Comment): Observable<any> {
    const connectionUrl = this.buildUri(`/${comment.id}`, comment.roomId);
    return this.http
      .put(connectionUrl, comment, httpOptions)
      .pipe(catchError(this.handleError<any>('updateComment')));
  }

  deleteCommentsByRoomId(roomId: string): Observable<Comment> {
    const connectionUrl = this.buildUri(`/byRoom?roomId=${roomId}`, roomId);
    return this.http
      .delete<Comment>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Comment>('deleteComment')));
  }

  deleteCommentsById(
    roomId: string,
    commentIds: string[]
  ): Observable<Comment[]> {
    const connectionUrl = this.buildUri('/bulkdelete', roomId);
    return this.http
      .post<Comment[]>(connectionUrl, commentIds, httpOptions)
      .pipe(catchError(this.handleError<Comment[]>('deleteCommentsById')));
  }

  countByRoomId(roomId: string, ack: boolean): Observable<number> {
    const connectionUrl = this.buildUri(
      `${this.apiUrl.find + this.serviceApiUrl.count}`,
      roomId
    );
    return this.http
      .post<number>(
        connectionUrl,
        {
          properties: { roomId: roomId, ack: ack },
          externalFilters: {},
        },
        httpOptions
      )
      .pipe(catchError(this.handleError<number>('countByRoomId', 0)));
  }

  answer(comment: Comment, answer: string): Observable<Comment> {
    comment.answer = answer;
    const changes: { answer: string } = { answer: comment.answer };
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
    const score = comment.score;
    return this.http.patch<Comment>(connectionUrl, changes, httpOptions).pipe(
      tap((c) => (c.score = score)),
      catchError(this.handleError<Comment>('patchComment'))
    );
  }

  highlight(comment: Comment): Observable<void> {
    const connectionUrl = this.buildUri(
      `/${
        comment.id + this.serviceApiUrl.command + this.serviceApiUrl.highlight
      }`,
      comment.roomId
    );
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

  lowlight(comment: Comment): Observable<void> {
    const connectionUrl = this.buildUri(
      `/${
        comment.id + this.serviceApiUrl.command + this.serviceApiUrl.lowlight
      }`,
      comment.roomId
    );
    return this.http.post<void>(connectionUrl, {}, httpOptions);
  }

  // Non http functions

  getExportData(comments: Comment[], delimiter: string): string {
    const exportComments: Comment[] = JSON.parse(JSON.stringify(comments));
    let valueFields = '';
    exportComments.forEach((element) => {
      valueFields +=
        this.filterNotSupportedCharacters(element['body']) + delimiter;
      const time = element['timestamp'];
      valueFields +=
        time.toString().slice(0, 10) +
        '-' +
        time.toString().slice(11, 16) +
        delimiter;
      const answer = element['answer'];
      valueFields +=
        (answer ? this.filterNotSupportedCharacters(answer) : '') + delimiter;
      valueFields += element['read'] + delimiter;
      valueFields += element['favorite'] + delimiter;
      valueFields += element['correct'] + delimiter;
      valueFields += element['score'] + delimiter;
      const tag = element['tag'];
      valueFields +=
        (tag ? this.filterNotSupportedCharacters(tag) : '') + '\r\n';
    });
    return valueFields;
  }

  filterNotSupportedCharacters(text: string): string {
    return (
      '"' +
      text
        .replace(/[\r\n]/g, ' ')
        .replace(/ +/g, ' ')
        .replace(/"/g, '""') +
      '"'
    );
  }

  export(comments: Comment[], room: Room, name?: string): void {
    let csv: string;
    const fieldNames = [
      'comment-export.question',
      'comment-export.timestamp',
      'comment-export.answer',
      'comment-export.presented',
      'comment-export.favorite',
      'comment-export.correct/wrong',
      'comment-export.score',
      'comment-export.tag',
    ];
    let keyFields;
    this.translateService
      .selectTranslate(fieldNames)
      .pipe(take(1))
      .subscribe((msgs) => {
        keyFields = [
          msgs[fieldNames[0]],
          msgs[fieldNames[1]],
          msgs[fieldNames[2]],
          msgs[fieldNames[3]],
          msgs[fieldNames[4]],
          msgs[fieldNames[5]],
          msgs[fieldNames[6]],
          msgs[fieldNames[7]],
          '\r\n',
        ];
        const date = new Date();
        const dateString = date.toLocaleDateString();
        csv = keyFields + this.getExportData(comments, ',');
        const myBlob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        const fileName =
          room.name +
          '_' +
          room.shortId +
          '_' +
          (name ? name : dateString) +
          '.csv';
        link.setAttribute('download', fileName);
        link.href = window.URL.createObjectURL(myBlob);
        link.click();
      });
  }

  getUpdatedCommentCountWithMessage(count: number, message: Message): number {
    const msg = JSON.parse(message.body);
    const payload = msg.payload;
    if (msg.type === 'CommentCreated') {
      count++;
    } else if (msg.type === 'CommentDeleted') {
      count--;
    } else if (msg.type === 'CommentPatched') {
      for (const [key, value] of Object.entries(payload.changes)) {
        switch (key) {
          case 'ack':
            if (!(<boolean>value)) {
              count--;
            }
            break;
        }
      }
    }
    return count;
  }

  filterComments(comments: Comment[], type: CommentFilter, tag?: string) {
    return comments.filter((c) => {
      switch (type) {
        case CommentFilter.CORRECT:
          return c.correct === CorrectWrong.CORRECT ? 1 : 0;
        case CommentFilter.WRONG:
          return c.correct === CorrectWrong.WRONG ? 1 : 0;
        case CommentFilter.FAVORITE:
          return c.favorite;
        case CommentFilter.TAG:
          return c.tag === tag;
        case CommentFilter.ANSWER:
          return c.answer;
      }
    });
  }

  sortComments(comments: Comment[], type: CommentSort): Comment[] {
    return comments.sort((a, b) => {
      if (type === CommentSort.VOTEASC) {
        return a.score > b.score ? 1 : b.score > a.score ? -1 : 0;
      } else if (type === CommentSort.VOTEDESC) {
        return b.score > a.score ? 1 : a.score > b.score ? -1 : 0;
      } else if (type === CommentSort.TIME) {
        const dateA = new Date(a.timestamp),
          dateB = new Date(b.timestamp);
        return +dateB > +dateA ? 1 : +dateA > +dateB ? -1 : 0;
      }
      return 1;
    });
  }

  filterCommentsByTimePeriod(
    comments: Comment[],
    period: CommentPeriod
  ): Comment[] {
    const currentTime = new Date();
    const hourInSeconds = 3600000;
    let periodInSeconds: number;
    if (period !== CommentPeriod.ALL) {
      switch (period) {
        case CommentPeriod.ONEHOUR:
          periodInSeconds = hourInSeconds;
          break;
        case CommentPeriod.THREEHOURS:
          periodInSeconds = hourInSeconds * 3;
          break;
        case CommentPeriod.ONEDAY:
          periodInSeconds = hourInSeconds * 24;
          break;
        case CommentPeriod.ONEWEEK:
          periodInSeconds = hourInSeconds * 168;
      }
      comments = comments.filter(
        (c) =>
          new Date(c.timestamp).getTime() >=
          currentTime.getTime() - periodInSeconds
      );
    }
    return comments;
  }
}
