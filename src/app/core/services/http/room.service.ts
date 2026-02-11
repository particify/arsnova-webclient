import { Injectable, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { RoomSummary } from '@app/core/models/room-summary';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { catchError, map, share, switchAll, tap } from 'rxjs/operators';
import { AbstractEntityService } from './abstract-entity.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { DefaultCache } from '@app/core/services/util/caching.service';

export interface RoomMessage {
  roomId: string;
  body: Record<string, any>;
}

@Injectable()
export class RoomService extends AbstractEntityService<Room> {
  private ws = inject(WsConnectorService);
  private globalStorageService = inject(GlobalStorageService);
  private feedbackService = inject(FeedbackService);

  serviceApiUrl = {
    duplicate: '/duplicate',
    v2Import: '/import/v2/room',
    summary: '/_view/room/summary',
  };

  private currentRoomId?: string;
  private currentRoomIdStream$ = new BehaviorSubject<string | undefined>(
    undefined
  );
  private messageStream$: Subject<Observable<IMessage>> = new Subject();
  private roomMessageStream$ = this.messageStream$.pipe(
    switchAll(),
    map(
      (message) =>
        ({
          roomId: this.currentRoomId!,
          body: JSON.parse(message.body),
        }) satisfies RoomMessage
    ),
    share()
  );
  private messageStreamSubscription?: Subscription;

  constructor() {
    super('Room', '/room');
  }

  /**
   * Joins a room or leave the current one. This sets up the subscription to
   * room events.
   *
   * @param room The room to join or null to leave the current room.
   */
  joinRoom(roomId?: string) {
    if (roomId && roomId === this.currentRoomId) {
      return;
    }
    this.currentRoomId = roomId;
    this.cachingService.getCache(DefaultCache.CURRENT_ROOM).clear();
    if (this.messageStreamSubscription) {
      this.messageStreamSubscription.unsubscribe();
      this.messageStream$.next(of());
    }
    if (!roomId) {
      this.currentRoomIdStream$.next(undefined);
      this.feedbackService.unsubscribe();
      this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
      return;
    }
    const legacyRoomId = roomId.replaceAll('-', '');
    this.messageStream$.next(
      this.ws.getWatcher(`/topic/${legacyRoomId}.stream`)
    );
    /* Make sure that at least one subscription is active even if we don't care
     * for event messages here. */
    this.messageStreamSubscription = this.messageStream$.subscribe();
    this.currentRoomIdStream$.next(roomId);
  }

  /**
   * Leaves the current room and unsubscribes from room events.
   */
  leaveCurrentRoom() {
    this.joinRoom();
  }

  getCurrentRoomIdStream(): Observable<string | undefined> {
    return this.currentRoomIdStream$;
  }

  getCurrentRoomsMessageStream(): Observable<RoomMessage> {
    return this.roomMessageStream$;
  }

  getCreatorRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find);
    return this.http
      .post<Room[]>(connectionUrl, {
        properties: { ownerId: userId },
        externalFilters: {},
      })
      .pipe(catchError(this.handleError('getCreatorRooms', [])));
  }

  getParticipantRooms(userId: string): Observable<Room[]> {
    const connectionUrl = this.buildUri(this.apiUrl.find);
    return this.http
      .post<Room[]>(connectionUrl, {
        properties: {},
        externalFilters: { inHistoryOfUserId: userId },
      })
      .pipe(catchError(this.handleError('getParticipantRooms', [])));
  }

  addRoom(room: Room): Observable<Room> {
    return this.postEntity(room).pipe(
      catchError(this.handleError<Room>(`add Room ${room}`))
    );
  }

  getRoom(id: string): Observable<Room> {
    return this.getById(id).pipe(
      tap((room) => this.setRoomId(room)),
      catchError(this.handleError<Room>(`getRoom keyword=${id}`))
    );
  }

  getRoomSummaries(ids: string[]): Observable<RoomSummary[]> {
    const connectionUrl = this.buildForeignUri(
      `${this.serviceApiUrl.summary}?ids=${ids.join(',')}`
    );
    return this.performForeignGet<RoomSummary[]>(connectionUrl).pipe(
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

  patchRoom(roomId: string, changes: object): Observable<Room> {
    return this.patchEntity(roomId, changes);
  }

  deleteRoom(roomId: string): Observable<Room> {
    return this.deleteEntity(roomId).pipe(
      catchError(this.handleError<Room>('deleteRoom'))
    );
  }

  duplicateRoom(
    roomId: string,
    temporary = false,
    name?: string
  ): Observable<Room> {
    const connectionUrl = this.buildForeignUri(
      this.serviceApiUrl.duplicate,
      roomId
    );
    const params: { [param: string]: string } = {};
    if (temporary) {
      params.temporary = 'true';
    }
    if (name) {
      params.name = name;
    }
    return this.http
      .post<Room>(connectionUrl, null, { params })
      .pipe(catchError(this.handleError<Room>(`duplicateRoom`)));
  }

  setRoomId(room: Room): void {
    this.globalStorageService.setItem(STORAGE_KEYS.ROOM_ID, room.id);
  }
}
