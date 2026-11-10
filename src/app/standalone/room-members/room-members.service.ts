import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { TranslocoService } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  GrantRoomRoleGql,
  RevokeRoomRoleGql,
  RoomManagingMembersByRoomIdGql,
  RoomMemberFragment,
  RoomRole,
} from '@gql/generated/graphql';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';

/** The people who manage a room with the owner. Only the owner may read or change them. */
@Injectable({ providedIn: 'root' })
export class RoomMembersService {
  private readonly apollo = inject(Apollo);
  private readonly dialogService = inject(DialogService);
  private readonly grantRoomRole = inject(GrantRoomRoleGql);
  private readonly membersByRoomId = inject(RoomManagingMembersByRoomIdGql);
  private readonly notificationService = inject(NotificationService);
  private readonly revokeRoomRole = inject(RevokeRoomRoleGql);
  private readonly translateService = inject(TranslocoService);

  /** The owner first, then everyone else in the order the backend returns them. */
  watchMembers(roomId: string): Observable<RoomMemberFragment[] | undefined> {
    return this.membersByRoomId
      .watch({ variables: { roomId } })
      .valueChanges.pipe(
        filter((r) => r.dataState === 'complete'),
        map((r) =>
          (r.data.roomManagingMembersByRoomId ?? []).toSorted((a) =>
            a.role === RoomRole.Owner ? -1 : 1
          )
        ),
        catchError(() => of([]))
      );
  }

  refetchMembers(roomId: string) {
    return this.membersByRoomId.fetch({
      variables: { roomId },
      fetchPolicy: 'network-only',
    });
  }

  /** Changes the role of an existing member in place. */
  changeRole(roomId: string, member: RoomMemberFragment, role: RoomRole) {
    this.grantRoomRole
      .mutate({ variables: { roomId, userId: member.user.id, role } })
      .subscribe((r) => {
        if (r.data?.grantRoomRole) {
          this.notify('share.role-changed', true);
        }
      });
  }

  /**
   * Revokes the member's role after confirmation. The member leaves the list only once the
   * confirmation dialog is gone, so focus and keys go to what is left rather than to a dialog on
   * its way out. Emits once the member is gone.
   */
  remove(roomId: string, member: RoomMemberFragment): Observable<void> {
    let revoked = false;
    return this.dialogService
      .openDeleteDialog(
        'room-moderator',
        'share.really-delete-user-rights',
        member.user.displayId ?? member.user.id,
        'dialog.remove',
        () =>
          this.revokeRoomRole
            .mutate({ variables: { roomId, userId: member.user.id } })
            .pipe(tap((r) => (revoked = !!r.data?.revokeRoomRole)))
      )
      .afterClosed()
      .pipe(
        filter(() => revoked),
        map(() => {
          this.evict(member);
          this.notify('share.user-removed', false);
        })
      );
  }

  private evict(member: RoomMemberFragment) {
    const cache = this.apollo.client.cache;
    const cacheId = cache.identify(member);
    if (cacheId) {
      cache.evict({ id: cacheId });
      cache.gc();
    }
  }

  private notify(key: string, success: boolean) {
    this.notificationService.showAdvanced(
      this.translateService.translate(key),
      success ? AdvancedSnackBarTypes.SUCCESS : AdvancedSnackBarTypes.WARNING
    );
  }
}
