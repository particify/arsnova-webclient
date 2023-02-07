import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentSettings } from '../../models/comment-settings';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { CachingService } from '../util/caching.service';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { WsCommentService } from '../websockets/ws-comment.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class CommentSettingsService extends AbstractCachingHttpService<CommentSettings> {
  constructor(
    private http: HttpClient,
    protected wsConnectorService: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected cachingService: CachingService,
    protected wsCommentService: WsCommentService
  ) {
    super(
      '/settings',
      http,
      wsConnectorService,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }

  get(id: string): Observable<CommentSettings> {
    const connectionUrl = this.buildUri(`/${id}`, id);
    if (!this.stompSubscription) {
      this.stompSubscription = this.wsCommentService
        .getCommentSettingsStream(id)
        .subscribe((msg) => {
          this.handleObjectCaching(connectionUrl, JSON.parse(msg.body).payload);
        });
    }
    return this.fetch(connectionUrl).pipe(
      catchError(this.handleError<CommentSettings>('addComment'))
    );
  }

  add(settings: CommentSettings): Observable<CommentSettings> {
    const connectionUrl = this.buildUri('/', settings.roomId);
    return this.http
      .post<CommentSettings>(connectionUrl, settings, httpOptions)
      .pipe(
        catchError(this.handleError<CommentSettings>('addCommentSettings'))
      );
  }

  update(settings: CommentSettings): Observable<CommentSettings> {
    const connectionUrl = this.buildUri(`/${settings.roomId}`, settings.roomId);
    return this.http
      .put(connectionUrl, settings, httpOptions)
      .pipe(catchError(this.handleError<any>('updateCommentSettings')));
  }
}
