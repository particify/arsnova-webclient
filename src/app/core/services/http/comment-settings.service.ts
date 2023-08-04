import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentSettings } from '@app/core/models/comment-settings';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { CachingService } from '@app/core/services/util/caching.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { RoomService } from './room.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class CommentSettingsService extends AbstractCachingHttpService<CommentSettings> {
  private currentRoomSettings$: Observable<CommentSettings>;
  constructor(
    private http: HttpClient,
    protected wsConnectorService: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected cachingService: CachingService,
    protected wsCommentService: WsCommentService,
    roomService: RoomService
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
    roomService.getCurrentRoomStream().subscribe((room) => {
      if (room) {
        // The uri is needed for updating cache
        const uri = this.buildUri(`/${room.id}`, room.id);
        this.currentRoomSettings$ = this.wsCommentService
          .getCommentSettingsStream(room.id)
          .pipe(
            map((msg) => JSON.parse(msg.body).payload),
            tap(
              (settings) => this.handleObjectCaching(uri, settings),
              shareReplay()
            )
          );
        this.stompSubscription = this.currentRoomSettings$.subscribe();
      } else {
        this.stompSubscription.unsubscribe();
      }
    });
  }

  getSettingsStream(): Observable<CommentSettings> {
    return this.currentRoomSettings$;
  }

  get(id: string): Observable<CommentSettings> {
    const connectionUrl = this.buildUri(`/${id}`, id);
    return this.fetchWithCache(connectionUrl).pipe(
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
      .put<CommentSettings>(connectionUrl, settings, httpOptions)
      .pipe(
        catchError(this.handleError<CommentSettings>('updateCommentSettings'))
      );
  }
}
