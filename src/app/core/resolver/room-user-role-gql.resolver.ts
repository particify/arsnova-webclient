import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { RoomMembershipByShortIdGql, RoomRole } from '@gql/generated/graphql';
import { filter, map } from 'rxjs';

export const roomUserRoleGqlResolver: ResolveFn<RoomRole> = (
  route: ActivatedRouteSnapshot
) => {
  const shortId = route.params['shortId'];
  return inject(RoomMembershipByShortIdGql)
    .fetch({ variables: { shortId: shortId } })
    .pipe(
      map((r) => r.data),
      filter((data) => !!data),
      map((data) => data.roomMembershipByShortId?.role ?? RoomRole.None)
    );
};
