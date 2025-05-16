import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class RoomResolver implements Resolve<Room> {
  private roomService = inject(RoomService);

  resolve(route: ActivatedRouteSnapshot): Observable<Room> {
    return this.roomService
      .getRoomByShortId(route.params['shortId'])
      .pipe(tap((room) => this.roomService.joinRoom(room)));
  }
}
