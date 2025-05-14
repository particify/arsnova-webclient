import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import {
  DataChanged,
  ModeratorDataChanged,
  PublicDataChanged,
} from '@app/core/models/events/data-changed';
import { RoomStats } from '@app/core/models/room-stats';
import { AbstractCachingHttpService } from './abstract-caching-http.service';

@Injectable()
export class RoomStatsService extends AbstractCachingHttpService<RoomStats> {
  constructor() {
    super('/stats');
    this.eventService
      .on<PublicDataChanged<RoomStats>>('PublicDataChanged')
      .pipe(filter((e) => e.payload.dataType === 'RoomStatistics'))
      .subscribe((e) => this.handlePublicDataChanged(e));
    this.eventService
      .on<ModeratorDataChanged<RoomStats>>('ModeratorDataChanged')
      .pipe(filter((e) => e.payload.dataType === 'RoomStatistics'))
      .subscribe((e) => this.handleModeratorDataChanged(e));
  }

  getStats(roomId: string, extendedView = false): Observable<RoomStats> {
    const queryParams = extendedView ? '?view=read-extended' : '';
    const connectionUrl = this.buildUri('', roomId);
    return this.fetchWithCache(connectionUrl + queryParams).pipe(
      catchError(this.handleError<RoomStats>(`getStats id=${roomId}`))
    );
  }

  public removeCacheEntry(roomId: string) {
    this.cache.remove(this.generateStatsCacheKey(roomId));
    this.cache.remove(this.generateStatsCacheKey(roomId, true));
  }

  private handlePublicDataChanged(e: DataChanged<RoomStats>) {
    this.cache.put(
      this.generateStatsCacheKey(e.payload.roomId),
      e.payload.data
    );
  }

  private handleModeratorDataChanged(e: DataChanged<RoomStats>) {
    this.cache.put(
      this.generateStatsCacheKey(e.payload.roomId, true),
      e.payload.data
    );
  }

  private generateStatsCacheKey(roomId: string, moderator = false) {
    const uri =
      this.buildUri('', roomId) + (moderator ? '?view=read-extended' : '');
    return this.generateCacheKey(uri);
  }
}
