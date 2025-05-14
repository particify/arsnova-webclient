import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';

/**
 * This resolver selects the room user role for views based on the required role
 * for routing and the user's room role.
 */
@Injectable()
export class RoomViewUserRoleResolver implements Resolve<UserRole> {
  private roomMembershipService = inject(RoomMembershipService);

  resolve(route: ActivatedRouteSnapshot): Observable<UserRole> {
    const viewRole = route.data['requiredRole'] as UserRole;

    /* Ignore the user's real role, always use PARTICIPANT role for view. */
    if (viewRole === UserRole.PARTICIPANT) {
      return of(UserRole.PARTICIPANT);
    }

    if (environment.debugOverrideRoomRole) {
      /* DEBUG: Override role handling */
      return of(UserRole.OWNER);
    }

    /* Use the user's real role for moderation. */
    if (
      this.roomMembershipService.isRoleSubstitutable(
        viewRole,
        UserRole.MODERATOR
      )
    ) {
      return this.roomMembershipService.getPrimaryRoleByRoom(
        route.params['shortId']
      );
    }

    throw Error(`No room view found for '${route.data['requiredRole']}'.`);
  }
}
