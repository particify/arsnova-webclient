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
import { JoinRoomGql, RoomRole } from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';

@Injectable()
export class AuthenticationGqlGuard implements CanActivate {
  private authenticationService = inject(AuthenticationService);
  private roomMembershipService = inject(RoomMembershipService);
  private roomService = inject(RoomService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private routingService = inject(RoutingService);
  private router = inject(Router);
  private joinRoomGql = inject(JoinRoomGql);

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
          return this.joinRoomGql
            .mutate({ shortId: route.params.shortId })
            .pipe(
              map((r) => r.data?.joinRoom.role),
              map((role) => {
                if (!role) {
                  /* This should not happen unless there is an issue with the route configuration */
                  this.handleAccessDenied(auth, state.url);
                  return false;
                }
                if (
                  this.roomMembershipService.isRoleSubstitutable(
                    role,
                    viewRole
                  ) ||
                  environment.debugOverrideRoomRole
                ) {
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

  handleUnknownError() {
    this.translateService
      .selectTranslate('errors.something-went-wrong')
      .pipe(take(1))
      .subscribe((msg) =>
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED)
      );
  }

  handleAccessDenied(auth?: ClientAuthentication, url?: string) {
    this.translateService
      .selectTranslate('errors.not-authorized')
      .pipe(take(1))
      .subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        if (url && auth?.authProvider === AuthProvider.ARSNOVA_GUEST) {
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
