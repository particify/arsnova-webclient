import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RoomRole } from '@gql/generated/graphql';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';

/**
 * This resolver selects the room user role for views based on the required role
 * for routing and the user's room role.
 */
@Injectable()
export class RoomViewUserRoleResolver implements Resolve<RoomRole> {
  private roomMembershipService = inject(RoomMembershipService);

  resolve(route: ActivatedRouteSnapshot): Observable<RoomRole> {
    const viewRole = route.data['requiredRole'] as RoomRole;

    /* Ignore the user's real role, always use PARTICIPANT role for view. */
    if (viewRole === RoomRole.Participant) {
      return of(RoomRole.Participant);
    }

    if (environment.debugOverrideRoomRole) {
      /* DEBUG: Override role handling */
      return of(RoomRole.Owner);
    }

    /* Use the user's real role for moderation. */
    if (
      this.roomMembershipService.isRoleSubstitutable(
        viewRole,
        RoomRole.Moderator
      )
    ) {
      return this.roomMembershipService.getPrimaryRoleByRoom(
        route.params['shortId']
      );
    }

    throw Error(`No room view found for '${route.data['requiredRole']}'.`);
  }
}
