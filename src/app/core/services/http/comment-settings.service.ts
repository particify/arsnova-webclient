import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CommentSettings } from '@app/core/models/comment-settings';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { RoomService } from './room.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class CommentSettingsService extends AbstractCachingHttpService<CommentSettings> {
  protected wsCommentService = inject(WsCommentService);

  private currentRoomSettings$: Observable<CommentSettings> = of();
  constructor() {
    super('/settings');
    const roomService = inject(RoomService);
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
