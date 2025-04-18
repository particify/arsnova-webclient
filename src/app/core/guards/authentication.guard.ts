import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoomRole } from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { environment } from '@environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private authenticationService = inject(AuthenticationService);
  private roomMembershipService = inject(RoomMembershipService);
  private roomService = inject(RoomService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private routingService = inject(RoutingService);
  private router = inject(Router);

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
          return this.roomMembershipService
            .hasAccessForRoom(route.params.shortId, viewRole)
            .pipe(
              switchMap((hasAccess) => {
                if (hasAccess) {
                  return of(true);
                }

                if (viewRole === RoomRole.Participant) {
                  /* First time access / not a member yet -> request membership */
                  return this.roomMembershipService
                    .requestMembership(route.params.shortId)
                    .pipe(
                      map(() => true),
                      catchError((e) => {
                        if (e instanceof HttpErrorResponse) {
                          if (e.status === 403) {
                            this.handleAccessDenied(auth, state.url);
                          } else if (e.status === 404) {
                            this.handleRoomNotFound();
                          } else {
                            this.handleUnknownError();
                          }
                        }
                        return of(false);
                      })
                    );
                } else {
                  if (environment.debugOverrideRoomRole) {
                    /* DEBUG: Override role handling */
                    return of(true);
                  }

                  this.handleAccessDenied(auth, state.url);
                  return of(false);
                }
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
