import { Injectable, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { RoomSummary } from '@app/core/models/room-summary';
import { SurveyStarted } from '@app/core/models/events/survey-started';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import {
  AuthenticationService,
  AUTH_HEADER_KEY,
  AUTH_SCHEME,
} from './authentication.service';
import { AbstractEntityService } from './abstract-entity.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { IMessage } from '@stomp/stompjs';
import { AdvancedSnackBarTypes } from '@app/core/services/util/notification.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { DefaultCache } from '@app/core/services/util/caching.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class RoomService extends AbstractEntityService<Room> {
  private ws = inject(WsConnectorService);
  private authService = inject(AuthenticationService);
  private globalStorageService = inject(GlobalStorageService);
  private feedbackService = inject(FeedbackService);

  serviceApiUrl = {
    duplicate: '/duplicate',
    generateRandomData: '/generate-random-data',
    transfer: '/transfer',
    v2Import: '/import/v2/room',
    summary: '/_view/room/summary',
  };

  private currentRoom?: Room;
  private currentRoomStream$ = new BehaviorSubject<Room | undefined>(undefined);
  private messageStream$: Observable<IMessage> = of();
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
  joinRoom(room?: Room) {
    if (room && room?.id === this.currentRoom?.id) {
      return;
    }
    this.currentRoom = room;
    this.currentRoomStream$.next(room);
    this.cachingService.getCache(DefaultCache.CURRENT_ROOM).clear();
    if (this.messageStreamSubscription) {
      this.messageStreamSubscription.unsubscribe();
      this.messageStream$ = of();
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

  getCurrentRoomStream(): Observable<Room | undefined> {
    return this.currentRoomStream$;
  }

  getCurrentRoomsMessageStream(): Observable<IMessage> {
    return this.messageStream$;
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
      map((room) => this.parseExtensions(room)),
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

  generateRandomData(roomId: string): Observable<void> {
    const connectionUrl = this.buildForeignUri(
      this.serviceApiUrl.generateRandomData,
      roomId
    );
    return this.http
      .post<void>(connectionUrl, null)
      .pipe(catchError(this.handleError<void>(`generateRandomData`)));
  }

  importv2Room(json: JSON): Observable<Room> {
    const connectionUrl = this.buildForeignUri(this.serviceApiUrl.v2Import);
    return this.http
      .post<Room>(connectionUrl, json, httpOptions)
      .pipe(catchError(this.handleError<Room>(`importv2Room, json: ${json}`)));
  }

  transferRoomThroughToken(id: string, authToken: string): Observable<Room> {
    const auth$ = this.authService.getCurrentAuthentication();
    const httpHeaders = new HttpHeaders().set(
      AUTH_HEADER_KEY,
      `${AUTH_SCHEME} ${authToken}`
    );
    return auth$.pipe(
      switchMap((auth) => {
        const connectionUrl = this.buildForeignUri(
          `${this.serviceApiUrl.transfer}?newOwnerToken=${auth.token}`,
          id
        );
        return this.http
          .post<Room>(connectionUrl, {}, { headers: httpHeaders })
          .pipe(
            catchError(this.handleError<Room>(`transferRoomFromGuest ${id}`))
          );
      })
    );
  }

  changeFeedbackLock(room: Room, isFeedbackLocked: boolean): Observable<Room> {
    const changes: { feedbackLocked: boolean; settings: object } = {
      feedbackLocked: isFeedbackLocked,
      settings: room.settings,
    };
    room.settings['feedbackLocked'] = isFeedbackLocked;
    return this.patchRoom(room.id, changes).pipe(
      map((updatedRoom) => {
        if (isFeedbackLocked) {
          const event = new SurveyStarted();
          this.eventService.broadcast(event.type);
        }
        const state = updatedRoom.settings.feedbackLocked
          ? 'stopped'
          : 'started';
        const msg = this.translateService.translate('creator.survey.' + state);
        this.notificationService.showAdvanced(
          msg,
          updatedRoom.settings.feedbackLocked
            ? AdvancedSnackBarTypes.WARNING
            : AdvancedSnackBarTypes.SUCCESS
        );
        return updatedRoom;
      })
    );
  }

  changeFeedbackType(
    room: Room,
    feedbackType: LiveFeedbackType
  ): Observable<Room> {
    const newType =
      feedbackType === LiveFeedbackType.FEEDBACK
        ? LiveFeedbackType.SURVEY
        : LiveFeedbackType.FEEDBACK;
    const feedbackExtension: { type: LiveFeedbackType } = { type: newType };
    if (!room.extensions) {
      room.extensions = {};
      room.extensions.feedback = feedbackExtension;
    } else {
      room.extensions.feedback = feedbackExtension;
    }
    const changes: { extensions: object } = { extensions: room.extensions };
    return this.patchRoom(room.id, changes);
  }

  parseExtensions(room: Room): Room {
    if (room.extensions) {
      const extensions = room.extensions;
      room.extensions = extensions;
    }
    return room;
  }

  setRoomId(room: Room): void {
    this.globalStorageService.setItem(STORAGE_KEYS.ROOM_ID, room.id);
  }
}
