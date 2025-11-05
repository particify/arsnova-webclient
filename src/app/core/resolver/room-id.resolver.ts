import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { RoomIdByShortIdGql } from '@gql/generated/graphql';
import { filter, map } from 'rxjs';

/**
 * A resolver that returns the current room ID (UUID).
 */
export const roomIdResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot
) => {
  const shortId = route.params['shortId'];
  return inject(RoomIdByShortIdGql)
    .fetch({ variables: { shortId: shortId } })
    .pipe(
      map((r) => r.data?.roomMembershipByShortId?.room.id),
      filter((id) => id !== undefined)
    );
};
