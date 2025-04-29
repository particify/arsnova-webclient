import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { RoomMembershipByShortIdGql, RoomRole } from '@gql/generated/graphql';
import { map } from 'rxjs';

export const roomUserRoleGqlResolver: ResolveFn<RoomRole> = (
  route: ActivatedRouteSnapshot
) => {
  const shortId = route.params['shortId'];
  return inject(RoomMembershipByShortIdGql)
    .fetch({ shortId: shortId })
    .pipe(map((r) => r.data.roomMembershipByShortId?.role ?? RoomRole.None));
};
