import { Injectable } from '@angular/core';
import { ContentGroup } from '../../models/content-group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { BaseHttpService } from './base-http.service';
import { EventService } from '../util/event.service';
import { GlobalStorageService, MemoryStorageKey } from '../util/global-storage.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class ContentGroupService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    rooms: '/room',
    user: '/user',
    findRooms: '/find',
    contentGroup: '/contentgroup',
    stats: '/stats'
  };

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private authService: AuthenticationService,
    private globalStorageService: GlobalStorageService
  ) {
    super();
  }

  getByRoomIdAndName(roomId: string, name: string): Observable<ContentGroup> {
    const encodedName = encodeURIComponent(name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId}${this.apiUrl.contentGroup}/${encodedName}`;
    return this.http.get<ContentGroup>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`getByRoomIdAndName, ${roomId}, ${name}`))
    );
  }

  post(roomId: string, name: string, entity: ContentGroup): Observable<ContentGroup> {
    delete entity.id;
    delete entity.revision;
    const encodedName = encodeURIComponent(name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId}${this.apiUrl.contentGroup}/${encodedName}`;
    return this.http.post<ContentGroup>(connectionUrl, entity, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`post, ${roomId}, ${name}`))
    );
  }

  delete(contentGroup: ContentGroup): Observable<ContentGroup> {
    const encodedName = encodeURIComponent(contentGroup.name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${contentGroup.roomId}${this.apiUrl.contentGroup}/${encodedName}`;
    contentGroup.contentIds = [];
    return this.http.post<ContentGroup>(connectionUrl, contentGroup, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`Delete, ${contentGroup.roomId}, ${name}`))
    );
  }

  addContentToGroup(roomId: string, name: string, contentId: String): Observable<void> {
    const encodedName = encodeURIComponent(name);
    const connectionUrl =
      `${this.apiUrl.base + this.apiUrl.rooms}/` +
      `${roomId + this.apiUrl.contentGroup}/${encodedName}/${contentId}`;
    return this.http.post<void>(connectionUrl, {}, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<void>(`addContentToGroup, ${roomId}, ${name}, ${contentId}`))
    );
  }

  updateGroup(roomId: string, name: string, contentGroup: ContentGroup): Observable<ContentGroup> {
    const encodedName = encodeURIComponent(name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId + this.apiUrl.contentGroup}/${encodedName}`;
    return this.http.put<ContentGroup>(connectionUrl, contentGroup, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`updateGroup, ${ roomId }, ${ name }, ${ ContentGroup }`))
    );
  }

  saveGroupInMemoryStorage(newGroup: string): boolean {
    if (newGroup !== '') {
      this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, newGroup);
      const groups: string [] = this.globalStorageService.getMemoryItem(MemoryStorageKey.CONTENT_GROUPS) || [];
      if (groups) {
        for (let i = 0; i < groups.length; i++) {
          if (newGroup === groups[i]) {
            return false;
          }
        }
      }
      groups.push(newGroup);
      this.globalStorageService.setMemoryItem(MemoryStorageKey.CONTENT_GROUPS, groups);
      return true;
    }
  }

  updateGroupInMemoryStorage(oldName: string, newName: string) {
    const groups: string[] = this.globalStorageService.getMemoryItem(MemoryStorageKey.CONTENT_GROUPS);
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] === oldName) {
        groups[i] = newName;
        this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, groups[i]);
        break;
      }
    }
    this.globalStorageService.setMemoryItem(MemoryStorageKey.CONTENT_GROUPS, groups);
  }

}
