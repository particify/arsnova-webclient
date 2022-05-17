import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserRole } from '../models/user-roles.enum';
import { RoomMembershipService } from '../services/room-membership.service';
import { environment } from '../../environments/environment';

/**
 * This resolver selects the room user role for views based on the required role
 * for routing and the user's room role.
 */
@Injectable()
export class RoomViewUserRoleResolver implements Resolve<UserRole> {
  constructor(
    private roomMembershipService: RoomMembershipService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserRole> {
    const viewRole = route.data['requiredRole'] || route.parent.data['requiredRole'] as UserRole;

    /* Ignore the user's real role, always use PARTICIPANT role for view. */
    if (viewRole === UserRole.PARTICIPANT) {
      return of(UserRole.PARTICIPANT);
    }

    if (environment.debugOverrideRoomRole) {
      /* DEBUG: Override role handling */
      return of(UserRole.CREATOR);
    }

    /* Use the user's real role for moderation. */
    if (this.roomMembershipService.isRoleSubstitutable(viewRole, UserRole.EXECUTIVE_MODERATOR)) {
      const shortId = route.params['shortId'] || route.parent.params['shortId']
      return this.roomMembershipService.getPrimaryRoleByRoom(shortId);
    }

    throw Error(`No room view found for '${route.data['requiredRole']}'.`);
  }
}
