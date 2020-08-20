import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserRole } from '../models/user-roles.enum';
import { RoomMembershipService } from '../services/room-membership.service';

@Injectable()
export class RoomUserRoleResolver implements Resolve<UserRole> {
  constructor(
    private roomMembershipService: RoomMembershipService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserRole> {
    return this.roomMembershipService.getPrimaryRoleByRoom(route.params['shortId']);
  }
}
