import { Injectable } from '@angular/core';
import { Room } from '../../models/room';
import { RoomSummary } from '../../models/room-summary';
import { SurveyStarted } from '../../models/events/survey-started';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { AuthenticationService, AUTH_HEADER_KEY, AUTH_SCHEME } from './authentication.service';
import { AbstractEntityService } from './abstract-entity.service';
import { EventService } from '../util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../util/global-storage.service';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { CachingService, DefaultCache } from '../util/caching.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class RoomService extends AbstractEntityService<Room> {

  serviceApiUrl = {
    transfer: '/transfer',
    v2Import: '/import/v2/room',
    summary: '/_view/room/summary'
  };

  private currentRoom: Room;
  private currentRoomStream$: BehaviorSubject<Room> = new BehaviorSubject(null);
  private messageStream$: Observable<IMessage>;
  private messageStreamSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private ws: WsConnectorService,
    private authService: AuthenticationService,
    private globalStorageService: GlobalStorageService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    private feedbackService: FeedbackService,
    protected cachingService: CachingService
  ) {
    super('Room', '/room', http, ws, eventService, translateService, notificationService, cachingService);
  }

  /**
   * Joins a room or leave the current one. This sets up the subscription to
   * room events.
   *
   * @param room The room to join or null to leave the current room.
   */
  joinRoom(room?: Room) {
    if (room && room?.id === this.currentRoom?.id) {
      return;
    }
    this.currentRoom = room;
    this.currentRoomStream$.next(room);
    this.cachingService.getCache(DefaultCache.CURRENT_ROOM).clear();
    if (this.messageStreamSubscription) {
      this.messageStreamSubscription.unsubscribe();
      this.messageStream$ = null;
    }
    if (!room) {
      this.feedbackService.unsubscribe();
      this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
      return;
    }
    this.messageStream$ = this.ws.getWatcher(`/topic/${room.id}.stream`);
    /* Make sure that at least one subscription is active even if we don't care
     * for event messages here. */
    this.messageStreamSubscription = this.messageStream$.subscribe();
  }

  /**
   * Leaves the current room and unsubscribes from room events.
   */
  leaveCurrentRoom() {
    this.joinRoom();
  }

  getCurrentRoomStream(): Observable<Room> {
    return this.currentRoomStream$;
  }

  getCurrentRoomsMessageStream(): Observable<IMessage> {
    return this.messageStream$;
  }

  getCreatorRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find);
    return this.http.post<Room[]>(connectionUrl, {
      properties: { ownerId: userId },
      externalFilters: {}
    }).pipe(
      catchError(this.handleError('getCreatorRooms', []))
    );
  }

  getParticipantRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find);
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
    return this.postEntity(room).pipe(
      catchError(this.handleError<Room>(`add Room ${room}`))
    );
  }

  getRoom(id: string): Observable<Room> {
    return this.getById(id).pipe(
      map(room => this.parseExtensions(room)),
      tap(room => this.setRoomId(room)),
      catchError(this.handleError<Room>(`getRoom keyword=${id}`))
    );
  }

  getRoomSummaries(ids: string[]): Observable<RoomSummary[]> {
    const connectionUrl = this.buildForeignUri(`${this.serviceApiUrl.summary}?ids=${ids.join(',')}`);
    return this.http.get<RoomSummary[]>(connectionUrl).pipe(
      catchError(this.handleError<RoomSummary[]>(`getRoomSummaries`))
    );
  }

  getRoomByShortId(shortId: string): Observable<Room> {
    const id = '~' + shortId;
    return this.getRoom(id);
  }

  updateRoom(updatedRoom: Room): Observable<Room> {
    return this.putEntity(updatedRoom).pipe(
      catchError(this.handleError<any>('updateRoom'))
    );
  }

  patchRoom(roomId: string, changes: object): void {
    this.patchEntity(roomId, changes).subscribe();
  }

  deleteRoom(roomId: string): Observable<Room> {
    return this.deleteEntity(roomId).pipe(
      catchError(this.handleError<Room>('deleteRoom'))
    );
  }

  importv2Room(json: JSON): Observable<Room> {
    const connectionUrl = this.buildForeignUri(this.serviceApiUrl.v2Import);
    return this.http.post<Room>(connectionUrl, json, httpOptions).pipe(
      catchError(this.handleError<Room>(`importv2Room, json: ${json}`))
    );
  }

  transferRoomThroughToken(id: string, authToken: string): Observable<Room> {
    const auth$ = this.authService.getCurrentAuthentication();
    const httpHeaders = new HttpHeaders().set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${authToken}`);
    return auth$.pipe(
        switchMap(auth => {
          const connectionUrl = this.buildForeignUri(`${this.serviceApiUrl.transfer}?newOwnerToken=${auth.token}`, id);
          return this.http.post<Room>(connectionUrl, {}, { headers: httpHeaders }).pipe(
             catchError(this.handleError<Room>(`transferRoomFromGuest ${id}`))
          );
        })
    );
  }

  changeFeedbackLock(roomId: string, isFeedbackLocked: boolean) {
    this.getRoom(roomId).subscribe(room => {
      const changes: { feedbackLocked: boolean, settings: object } = { feedbackLocked: isFeedbackLocked, settings: room.settings };
      room.settings['feedbackLocked'] = isFeedbackLocked;
      this.patchRoom(roomId, changes);
      if (!isFeedbackLocked) {
        const event = new SurveyStarted();
        this.eventService.broadcast(event.type);
      }
    });
  }

  changeFeedbackType(roomId: string, feedbackType: string) {
    this.getRoom(roomId).subscribe(room => {
      const feedbackExtension: { type: string } = { type: feedbackType };
      if (!room.extensions) {
        room.extensions = {};
        room.extensions.feedback = feedbackExtension;
      } else {
        room.extensions.feedback = feedbackExtension;
      }
      const changes: { extensions: object } = { extensions: room.extensions };
      this.patchRoom(roomId, changes);
    });
  }

  parseExtensions(room: Room): Room {
    if (room.extensions) {
      let extensions: { [key: string ]: object };
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
