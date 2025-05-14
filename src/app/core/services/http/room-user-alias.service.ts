import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AbstractEntityService } from './abstract-entity.service';
import { RoomUserAlias } from '@app/core/models/room-user-alias';

@Injectable({
  providedIn: 'root',
})
export class RoomUserAliasService extends AbstractEntityService<RoomUserAlias> {
  serviceApiUrl = {
    generate: '/-/generate',
  };

  currentAlias$ = new BehaviorSubject<RoomUserAlias | undefined>(undefined);

  constructor() {
    super('RoomUserAlias', '/user-alias');
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
