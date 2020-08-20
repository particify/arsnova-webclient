import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserRole } from '../models/user-roles.enum';
import { RoomMembershipService } from '../services/room-membership.service';

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
    const viewRole = route.data['requiredRole'] as UserRole;

    /* Ignore the user's real role, always use PARTICIPANT role for view. */
    if (viewRole === UserRole.PARTICIPANT) {
      return of(UserRole.PARTICIPANT);
    }
    /* Use the user's real role for moderation. */
    if (this.roomMembershipService.isRoleSubstitutable(viewRole, UserRole.EXECUTIVE_MODERATOR)) {
      return this.roomMembershipService.getPrimaryRoleByRoom(route.params['shortId']).pipe(
        first()
      );
    }

    throw Error(`No room view found for '${route.data['requiredRole']}'.`);
  }
}
