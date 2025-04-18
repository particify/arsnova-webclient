import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RoomRole } from '@gql/generated/graphql';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment.prod';

@Injectable()
export class RoomUserRoleResolver implements Resolve<RoomRole> {
  private roomMembershipService = inject(RoomMembershipService);

  resolve(route: ActivatedRouteSnapshot): Observable<RoomRole> {
    return environment.debugOverrideRoomRole
      ? /* DEBUG: Override role handling */
        of(RoomRole.Owner)
      : this.roomMembershipService.getPrimaryRoleByRoom(
          route.params['shortId']
        );
  }
}
