import { Injectable } from '@angular/core';
import { ContentGroup } from '../../models/content-group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { AbstractEntityService } from './abstract-entity.service';
import { EventService } from '../util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { RoomService } from './room.service';
import { ContentGroupStatistics } from '../../models/content-group-statistics';
import { CachingService } from '../util/caching.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class ContentGroupService extends AbstractEntityService<ContentGroup> {
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private globalStorageService: GlobalStorageService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    private roomService: RoomService,
    cachingService: CachingService) {
    super('/contentgroup', http, eventService, translateService, notificationService, cachingService);
  }

  getStatsByRoomIdAndName(roomId: string, name: string): Observable<ContentGroupStatistics> {
    return this.roomService.getStats(roomId).pipe(
      map(stats => stats.groupStats.find(groupStats => groupStats.groupName === name)));
  }

  getByRoomIdAndName(roomId: string, name: string): Observable<ContentGroup> {
    return this.roomService.getStats(roomId).pipe(
      map(stats => stats.groupStats.find(groupStats => groupStats.groupName === name).id),
      mergeMap(id => this.getById(id, { roomId: roomId })));
  }

  post(entity: ContentGroup): Observable<ContentGroup> {
    delete entity.id;
    delete entity.revision;
    return this.postEntity(entity, entity.roomId).pipe(
      catchError(this.handleError<ContentGroup>(`post, ${entity.roomId}, ${entity.name}`))
    );
  }

  delete(contentGroup: ContentGroup): Observable<ContentGroup> {
    contentGroup.contentIds = [];
    return this.updateGroup(contentGroup).pipe(
      catchError(this.handleError<ContentGroup>(`Delete, ${contentGroup.roomId}, ${contentGroup.name}`))
    );
  }

  addContentToGroup(roomId: string, name: string, contentId: String): Observable<void> {
    const connectionUrl = this.buildUri('/-/content/', roomId);
    return this.http.post<void>(connectionUrl,
      { roomId: roomId, contentGroupName: name, contentId: contentId },
      httpOptions).pipe(
        catchError(this.handleError<void>(`addContentToGroup, ${roomId}, ${name}, ${contentId}`))
    );
  }

  updateGroup(contentGroup: ContentGroup): Observable<ContentGroup> {
    return this.putEntity(contentGroup, contentGroup.roomId).pipe(
      catchError(this.handleError<ContentGroup>(`updateGroup, ${ contentGroup.roomId }, ${ contentGroup.name }, ${ ContentGroup }`))
    );
  }

  patchContentGroup(group: ContentGroup, changes: object): Observable<ContentGroup> {
    return this.patchEntity(group.id, changes, group.roomId).pipe(
      catchError(this.handleError<any>('patchContentGroup'))
    );
  }

  saveGroupInMemoryStorage(newGroup: string): boolean {
    if (newGroup !== '') {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, newGroup);
      const groups: string [] = this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS) || [];
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
    const groups: string[] = this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS);
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

  removeContentFromGroup(roomId: string, groupId: string, contentId: String): Observable<void> {
    const connectionUrl = this.buildUri(`/${groupId}/content/${contentId}`, roomId);
    return this.http.delete<void>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<void>(`deleteContentFromGroup, ${roomId}, ${contentId}`))
    );
  }

}
