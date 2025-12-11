import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  JoinRoomGql,
  RoomByIdDocument,
  RoomByShortIdDocument,
  RoomMembershipByIdDocument,
  RoomMembershipByShortIdDocument,
  RoomMembershipFragment,
  RoomRole,
} from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';
import { RoutingService } from '@app/core/services/util/routing.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { Apollo } from 'apollo-angular';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly roomMembershipService = inject(RoomMembershipService);
  private readonly roomService = inject(RoomService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly routingService = inject(RoutingService);
  private readonly router = inject(Router);
  private readonly joinRoom = inject(JoinRoomGql);
  private readonly apollo = inject(Apollo);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (!route.params.shortId) {
      this.roomService.leaveCurrentRoom();
    }
    // Get roles having access to this route
    // undefined if every logged in user should have access regardless of its role
    const viewRole = route.data['requiredRole'] as RoomRole;
    // Allow access when user is logged in AND
    // the route doesn't require a specific role OR
    // the user's role is one of the required roles
    return this.authenticationService.requireAuthentication().pipe(
      switchMap((auth) => {
        if (!auth) {
          /* User is still not logged in (shouldn't usually happen) */
          this.handleAccessDenied(auth, state.url);
          return of(false);
        }

        if (!viewRole) {
          /* Route doesn't require a specific role */
          return of(true);
        } else {
          /* Route requires a specific role */
          const shortId = route.params.shortId;
          // Try to load room membership from apollo cache
          const membership = this.apollo.client.cache.readQuery({
            query: RoomMembershipByShortIdDocument,
            variables: { shortId },
          }) as { roomMembershipByShortId: RoomMembershipFragment } | undefined;
          const role = membership?.roomMembershipByShortId.role;
          // If membership was cached, check cached role for permission
          if (role && this.hasRolePermission(role, viewRole)) {
            return of(true);
          }
          // If no membership is available, join room
          return this.joinRoom
            .mutate({
              variables: { shortId },
              update: (_, result) => {
                const membership = result.data?.joinRoom;
                if (membership) {
                  this.updateMembershipCaches(membership);
                }
              },
            })
            .pipe(
              map((r) => r.data?.joinRoom.role),
              map((role) => {
                if (!role) {
                  /* This should not happen unless there is an issue with the route configuration */
                  this.handleAccessDenied(auth, state.url);
                  return false;
                }
                if (this.hasRolePermission(role, viewRole)) {
                  return true;
                }

                this.handleAccessDenied(auth, state.url);
                return false;
              })
            );
        }
      })
    );
  }

  private hasRolePermission(role: RoomRole, requiredRole: RoomRole) {
    return (
      this.roomMembershipService.isRoleSubstitutable(role, requiredRole) ||
      environment.debugOverrideRoomRole
    );
  }

  private updateMembershipCaches(membership: RoomMembershipFragment) {
    const cache = this.apollo.client.cache;
    const roomId = membership.room.id;
    const shortId = membership.room.shortId;
    cache.writeQuery({
      query: RoomByIdDocument,
      variables: { id: roomId },
      data: {
        roomById: membership.room,
      },
    });
    cache.writeQuery({
      query: RoomByShortIdDocument,
      variables: { shortId },
      data: {
        roomByShortId: membership.room,
      },
    });
    cache.writeQuery({
      query: RoomMembershipByIdDocument,
      variables: { roomId },
      data: {
        roomMembershipById: membership,
      },
    });
    cache.writeQuery({
      query: RoomMembershipByShortIdDocument,
      variables: { shortId },
      data: {
        roomMembershipByShortId: membership,
      },
    });
  }

  handleUnknownError() {
    this.translateService
      .selectTranslate('errors.something-went-wrong')
      .pipe(take(1))
      .subscribe((msg) =>
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED)
      );
  }

  handleAccessDenied(auth?: AuthenticatedUser, url?: string) {
    this.translateService
      .selectTranslate('errors.not-authorized')
      .pipe(take(1))
      .subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        if (url && !auth?.verified) {
          this.routingService.setRedirect(url);
          this.router.navigate(['login']);
        } else {
          if (this.router.url !== '/user') {
            this.router.navigate(['']);
          }
        }
      });
  }

  handleRoomNotFound() {
    this.translateService
      .selectTranslate('errors.room-not-found')
      .pipe(take(1))
      .subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.FAILED
        );
        if (this.router.url !== '/user') {
          this.router.navigateByUrl('home');
        }
      });
  }
}
