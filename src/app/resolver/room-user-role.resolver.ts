import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserRole } from '../models/user-roles.enum';
import { RoomMembershipService } from '../services/room-membership.service';
import { environment } from '../../environments/environment.prod';

@Injectable()
export class RoomUserRoleResolver implements Resolve<UserRole> {
  constructor(
    private roomMembershipService: RoomMembershipService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserRole> {
    return environment.debugOverrideRoomRole
      /* DEBUG: Override role handling */
      ? of(UserRole.CREATOR)
      : this.roomMembershipService.getPrimaryRoleByRoom(route.params['shortId']);
  }
}
