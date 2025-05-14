import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AbstractEntityService } from './abstract-entity.service';
import { EventService } from '@app/core/services/util/event.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CachingService } from '@app/core/services/util/caching.service';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';

@Injectable({
  providedIn: 'root',
})
export class RoomUserAliasService extends AbstractEntityService<RoomUserAlias> {
  private http: HttpClient;
  protected wsConnectorService: WsConnectorService;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;
  protected cachingService: CachingService;

  serviceApiUrl = {
    generate: '/-/generate',
  };

  currentAlias$ = new BehaviorSubject<RoomUserAlias | undefined>(undefined);

  constructor() {
    const http = inject(HttpClient);
    const wsConnectorService = inject(WsConnectorService);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);
    const cachingService = inject(CachingService);

    super(
      'RoomUserAlias',
      '/user-alias',
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
  }

  updateAlias(
    roomId: string,
    userId: string,
    changes: object
  ): Observable<RoomUserAlias> {
    const connectionUrl = this.buildUri('/', roomId);
    const body = { ...changes, roomId: roomId, userId: userId };
    return this.http
      .post<RoomUserAlias>(connectionUrl, body)
      .pipe(tap((alias) => this.currentAlias$.next(alias)));
  }

  getCurrentAlias(): Observable<RoomUserAlias | undefined> {
    return this.currentAlias$;
  }

  generateAlias(roomId: string): Observable<RoomUserAlias> {
    const connectionUrl = this.buildUri(this.serviceApiUrl.generate, roomId);
    return this.http.post<RoomUserAlias>(connectionUrl, {});
  }
}
