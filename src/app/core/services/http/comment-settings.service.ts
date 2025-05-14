import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CommentSettings } from '@app/core/models/comment-settings';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';
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
  private http: HttpClient;
  protected wsConnectorService: WsConnectorService;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;
  protected cachingService: CachingService;
  protected wsCommentService = inject(WsCommentService);

  private currentRoomSettings$: Observable<CommentSettings> = of();
  constructor() {
    const http = inject(HttpClient);
    const wsConnectorService = inject(WsConnectorService);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);
    const cachingService = inject(CachingService);
    const roomService = inject(RoomService);

    super(
      '/settings',
      http,
      wsConnectorService,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
    this.http = http;
    this.wsConnectorService = wsConnectorService;
    this.eventService = eventService;
    this.translateService = translateService;
    this.notificationService = notificationService;
    this.cachingService = cachingService;

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
        if (this.stompSubscription) {
          this.stompSubscription.unsubscribe();
        }
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
