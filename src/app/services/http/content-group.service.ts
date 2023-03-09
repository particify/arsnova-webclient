import { Injectable } from '@angular/core';
import { ContentGroup } from '../../models/content-group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import { EventService } from '../util/event.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '../util/global-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { RoomStatsService } from './room-stats.service';
import { ContentGroupStatistics } from '../../models/content-group-statistics';
import { CachingService } from '../util/caching.service';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { AnswerResultOverview } from '../../models/answer-result';
import { SeriesCreated } from '../../models/events/series-created';
import { SeriesDeleted } from '../../models/events/series-deleted';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class ContentGroupService extends AbstractEntityService<ContentGroup> {
  constructor(
    private http: HttpClient,
    protected ws: WsConnectorService,
    private globalStorageService: GlobalStorageService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    private roomStatsService: RoomStatsService,
    cachingService: CachingService
  ) {
    super(
      'ContentGroup',
      '/contentgroup',
      http,
      ws,
      eventService,
      translateService,
      notificationService,
      cachingService
    );
  }

  getStatsByRoomIdAndName(
    roomId: string,
    name: string,
    extendedView = false
  ): Observable<ContentGroupStatistics> {
    return this.roomStatsService
      .getStats(roomId, extendedView)
      .pipe(
        map((stats) =>
          stats.groupStats.find((groupStats) => groupStats.groupName === name)
        )
      );
  }

  getByRoomIdAndName(
    roomId: string,
    name: string,
    extendedView = false
  ): Observable<ContentGroup> {
    return this.roomStatsService.getStats(roomId, extendedView).pipe(
      map(
        (stats) =>
          stats.groupStats.find((groupStats) => groupStats.groupName === name)
            .id
      ),
      mergeMap((id) => this.getById(id, { roomId: roomId }))
    );
  }

  post(entity: ContentGroup): Observable<ContentGroup> {
    delete entity.id;
    delete entity.revision;
    return this.postEntity(entity, entity.roomId).pipe(
      tap((group) => {
        this.roomStatsService.removeCacheEntry(entity.roomId);
        this.sendCreatedEvent(group);
      }),
      catchError(
        this.handleError<ContentGroup>(`post, ${entity.roomId}, ${entity.name}`)
      )
    );
  }

  sendCreatedEvent(group: ContentGroup) {
    const event = new SeriesCreated(group);
    this.eventService.broadcast(event.type, event.payload);
  }

  delete(contentGroup: ContentGroup): Observable<ContentGroup> {
    return this.deleteEntity(contentGroup.id, contentGroup.roomId).pipe(
      tap(() => {
        this.roomStatsService.removeCacheEntry(contentGroup.roomId);
        this.sendDeletedEvent(contentGroup);
      }),
      catchError(
        this.handleError<ContentGroup>(
          `Delete, ${contentGroup.roomId}, ${contentGroup.name}`
        )
      )
    );
  }

  sendDeletedEvent(group: ContentGroup) {
    const event = new SeriesDeleted(group);
    this.eventService.broadcast(event.type, event.payload);
  }

  addContentToGroup(
    roomId: string,
    name: string,
    contentId: string
  ): Observable<void> {
    const connectionUrl = this.buildUri('/-/content/', roomId);
    return this.http
      .post<void>(
        connectionUrl,
        { roomId: roomId, contentGroupName: name, contentId: contentId },
        httpOptions
      )
      .pipe(
        catchError(
          this.handleError<void>(
            `addContentToGroup, ${roomId}, ${name}, ${contentId}`
          )
        )
      );
  }

  updateGroup(contentGroup: ContentGroup): Observable<ContentGroup> {
    return this.putEntity(contentGroup, contentGroup.roomId).pipe(
      catchError(
        this.handleError<ContentGroup>(
          `updateGroup, ${contentGroup.roomId}, ${contentGroup.name}, ${ContentGroup}`
        )
      )
    );
  }

  patchContentGroup(
    group: ContentGroup,
    changes: object
  ): Observable<ContentGroup> {
    return this.patchEntity(group.id, changes, group.roomId).pipe(
      catchError(this.handleError<any>('patchContentGroup'))
    );
  }

  saveGroupInMemoryStorage(newGroup: string): boolean {
    if (newGroup !== '') {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newGroup);
      const groups: string[] =
        this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS) || [];
      if (groups) {
        for (let i = 0; i < groups.length; i++) {
          if (newGroup === groups[i]) {
            return false;
          }
        }
      }
      groups.push(newGroup);
      this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
      return true;
    }
  }

  updateGroupInMemoryStorage(oldName: string, newName: string) {
    const groups: string[] = this.globalStorageService.getItem(
      STORAGE_KEYS.CONTENT_GROUPS
    );
    if (groups) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i] === oldName) {
          groups[i] = newName;
          this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, groups[i]);
          break;
        }
      }
    } else {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newName);
    }
    this.globalStorageService.setItem(STORAGE_KEYS.CONTENT_GROUPS, groups);
  }

  sortContentGroupsByName(contentGroups: ContentGroup[]): ContentGroup[] {
    return contentGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  import(roomId: string, groupId: string, blob: Blob) {
    const connectionUrl = this.buildUri(`/${groupId}/import`, roomId);
    const formData = new FormData();
    formData.append('file', blob);
    return this.httpClient.post(connectionUrl, formData);
  }

  getAnswerStats(
    roomId: string,
    groupId: string,
    userId: string
  ): Observable<AnswerResultOverview> {
    const connectionUrl = this.buildUri(
      `/${groupId}/stats/user/${userId}`,
      roomId
    );
    return this.http
      .get<AnswerResultOverview>(connectionUrl, httpOptions)
      .pipe(
        catchError(
          this.handleError<AnswerResultOverview>('getAnswerResultOverview')
        )
      );
  }
}
