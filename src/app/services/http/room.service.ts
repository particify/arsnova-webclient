import { Injectable } from '@angular/core';
import { Room } from '../../models/room';
import { RoomStats } from '../../models/room-stats';
import { ContentGroup } from '../../models/content-group';
import { RoomSummary } from '../../models/room-summary';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { BaseHttpService } from './base-http.service';
import { EventService } from '../util/event.service';
import { TSMap } from 'typescript-map';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class RoomService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    rooms: '/room',
    user: '/user',
    findRooms: '/find',
    stats: '/stats',
    contentGroup: '/contentgroup',
    v2Import: '/import/v2/room',
    summary: '/_view/room/summary',
  };
  private joinDate = new Date(Date.now());

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private authService: AuthenticationService,
    private globalStorageService: GlobalStorageService
  ) {
    super();
  }

  getCreatorRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.rooms + this.apiUrl.findRooms;
    return this.http.post<Room[]>(connectionUrl, {
      properties: { ownerId: userId },
      externalFilters: {}
    }).pipe(
      catchError(this.handleError('getCreatorRooms', []))
    );
  }

  getParticipantRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.rooms + this.apiUrl.findRooms;
    return this.http.post<Room[]>(connectionUrl, {
      properties: {},
      externalFilters: { inHistoryOfUserId: userId }
    }).pipe(
      catchError(this.handleError('getParticipantRooms', []))
    );
  }

  addRoom(room: Room): Observable<Room> {
    delete room.id;
    delete room.revision;
    const connectionUrl = this.apiUrl.base + this.apiUrl.rooms + '/';
    return this.http.post<Room>(connectionUrl, room, httpOptions).pipe(
      catchError(this.handleError<Room>(`add Room ${room}`))
    );
  }

  getRoom(id: string): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${id}`;
    return this.http.get<Room>(connectionUrl).pipe(
      map(room => this.parseExtensions(room)),
      tap(room => this.setRoomId(room)),
      catchError(this.handleError<Room>(`getRoom keyword=${id}`))
    );
  }

  getRoomSummaries(ids: string[]): Observable<RoomSummary[]> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.summary}?ids=${ids.join(',')}`;
    return this.http.get<RoomSummary[]>(connectionUrl).pipe(
      catchError(this.handleError<RoomSummary[]>(`getRoomSummaries`))
    );
  }

  getRoomByShortId(shortId: string): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/~${shortId}`;
    return this.http.get<Room>(connectionUrl).pipe(
      map(room => this.parseExtensions(room)),
      tap(room => this.setRoomId(room)),
      catchError(this.handleError<Room>(`getRoom shortId=${shortId}`))
    );
  }

  addToHistory(userId: string, roomId: string): void {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${userId}/roomHistory`;
    this.http.post(connectionUrl, { roomId: roomId, lastVisit: this.joinDate.getTime() }, httpOptions).subscribe(() => {
    });
  }

  removeFromHistory(userId: string, roomId: string): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.user}/${userId}/roomHistory/${roomId}`;
    return this.http.delete<Room>(connectionUrl, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<Room>('deleteRoom'))
    );
  }

  updateRoom(updatedRoom: Room): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/~${updatedRoom.shortId}`;
    return this.http.put(connectionUrl, updatedRoom, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<any>('updateRoom'))
    );
  }

  patchRoom(roomId: string, changes: TSMap<string, any>): void {
    const connectionUrl = `${ this.apiUrl.base + this.apiUrl.rooms }/${ roomId }`;
    this.http.patch(connectionUrl, changes, httpOptions).subscribe();
  }

  deleteRoom(roomId: string): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId}`;
    return this.http.delete<Room>(connectionUrl, httpOptions).pipe(
      tap(() => ''),
      catchError(this.handleError<Room>('deleteRoom'))
    );
  }

  getStats(roomId: string): Observable<RoomStats> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId}${this.apiUrl.stats}`;
    return this.http.get<RoomStats>(connectionUrl).pipe(
      tap(() => ''),
      catchError(this.handleError<RoomStats>(`getStats id=${roomId}`))
    );
  }

  getGroupByRoomIdAndName(roomId: string, name: string): Observable<ContentGroup> {
    const encodedName = encodeURIComponent(name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId + this.apiUrl.contentGroup}/${encodedName}`;
    return this.http.get<ContentGroup>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`getGroupByRoomIdAndName, ${roomId}, ${name}`))
    );
  }

  importv2Room(json: JSON): Observable<Room> {
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.v2Import}`;
    return this.http.post<Room>(connectionUrl, json, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<Room>(`importv2Room, json: ${json}`))
    );
  }

  changeFeedbackLock(roomId: string, isFeedbackLocked: boolean) {
    this.getRoom(roomId).subscribe(room => {
      const changes = new TSMap<string, any>();
      room.settings['feedbackLocked'] = isFeedbackLocked;
      changes.set('settings', room.settings);
      this.patchRoom(roomId, changes);
    });
  }

  changeFeedbackType(roomId: string, feedbackType: string) {
    this.getRoom(roomId).subscribe(room => {
      const feedbackExtension: TSMap<string, any> = new TSMap();
      feedbackExtension.set('type', feedbackType);
      room.extensions['feedback'] = feedbackExtension;
      const changes = new TSMap<string, any>();
      changes.set('extensions', room.extensions);
      this.patchRoom(roomId, changes);
    });
  }

  parseExtensions(room: Room): Room {
    if (room.extensions) {
      let extensions: TSMap<string, TSMap<string, any>> = new TSMap();
      extensions = room.extensions;
      room.extensions = extensions;
    }
    return room;
  }

  setRoomId(room: Room): void {
    this.globalStorageService.setItem(STORAGE_KEYS.ROOM_ID, room.id);
    this.globalStorageService.setItem(STORAGE_KEYS.SHORT_ID, room.shortId);
  }
}
