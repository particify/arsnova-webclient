import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';
import { RoomMembershipByShortIdGql, RoomRole } from '@gql/generated/graphql';
import { map, of } from 'rxjs';

/**
 * This resolver selects the room user role for views based on the required role
 * for routing and the user's room role.
 */
export const roomViewUserRoleGqlResolver: ResolveFn<RoomRole> = (
  route: ActivatedRouteSnapshot
) => {
  const viewRole = route.data['requiredRole'] as RoomRole;
  const roomMembershipService = inject(RoomMembershipService);
  const roomMembershipByShortIdGql = inject(RoomMembershipByShortIdGql);

  /* Ignore the user's real role, always use PARTICIPANT role for view. */
  if (viewRole === RoomRole.Participant) {
    return of(RoomRole.Participant);
  }

  if (environment.debugOverrideRoomRole) {
    /* DEBUG: Override role handling */
    return of(RoomRole.Owner);
  }

  /* Use the user's real role for moderation. */
  if (roomMembershipService.isRoleSubstitutable(viewRole, RoomRole.Moderator)) {
    return roomMembershipByShortIdGql
      .fetch({
        shortId: route.params['shortId'],
      })
      .pipe(map((r) => r.data.roomMembershipByShortId?.role ?? RoomRole.None));
  }

  throw Error(`No room view found for '${route.data['requiredRole']}'.`);
};
