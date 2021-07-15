import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RoomStats } from '../../models/room-stats';
import { EventService } from '../util/event.service';
import { NotificationService } from '../util/notification.service';
import { AbstractHttpService } from './abstract-http.service';

@Injectable()
export class RoomStatsService extends AbstractHttpService<RoomStats> {
  constructor(
    protected http: HttpClient,
    eventService: EventService,
    translateService: TranslateService,
    notificationService: NotificationService
  ) {
    super('/stats', http, eventService, translateService, notificationService);
  }

  getStats(roomId: string, extendedView = false): Observable<RoomStats> {
    const queryParams = extendedView ? '?view=read-extended' : '';
    const connectionUrl = this.buildUri('', roomId);
    return this.http.get<RoomStats>(connectionUrl + queryParams).pipe(
      catchError(this.handleError<RoomStats>(`getStats id=${roomId}`))
    );
  }
}
