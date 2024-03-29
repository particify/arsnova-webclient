import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment.prod';

@Injectable()
export class RoomUserRoleResolver implements Resolve<UserRole> {
  constructor(private roomMembershipService: RoomMembershipService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserRole> {
    return environment.debugOverrideRoomRole
      ? /* DEBUG: Override role handling */
        of(UserRole.OWNER)
      : this.roomMembershipService.getPrimaryRoleByRoom(
          route.params['shortId']
        );
  }
}
