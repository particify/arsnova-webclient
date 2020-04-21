import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from '../models/room';
import { RoomService } from '../services/http/room.service';

@Injectable()
export class RoomResolver implements Resolve<Room> {

  constructor(
    private roomService: RoomService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Room> {
    return this.roomService.getRoomByShortId(route.params['shortId']);
  }
}
