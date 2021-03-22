import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthenticationService } from '../services/http/authentication.service';
import { EventService } from '../services/util/event.service';
import { AdvancedSnackBarTypes, NotificationService } from '../services/util/notification.service';
import { UserRole } from '../models/user-roles.enum';
import { MembershipsChanged } from '../models/events/memberships-changed';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../services/http/room.service';
import { RoomMembershipService } from '../services/room-membership.service';
import { environment } from '../../environments/environment';
import { UserService } from '../services/http/user.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private roomMembershipService: RoomMembershipService,
              private roomService: RoomService,
              private userService: UserService,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              private eventService: EventService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> {
    if (!route.params.shortId) {
      this.roomService.leaveCurrentRoom();
    }
    // Get roles having access to this route
    // undefined if every logged in user should have access regardless of its role
    const viewRole = route.data['requiredRole'] as UserRole;
    // Allow access when user is logged in AND
    // the route doesn't require a specific role OR
    // the user's role is one of the required roles
    return this.authenticationService.requireAuthentication().pipe(switchMap(auth => {
      if (!auth) {
        /* User is still not logged in (shouldn't usually happen) */
        this.handleAccessDenied();
        return of(false);
      }

      if (!viewRole) {
        /* Route doesn't require a specific role */
        return of(true);
      } else {
        /* Route requires a specific role */
        return this.roomMembershipService.hasAccessForRoom(route.params.shortId, viewRole).pipe(
            switchMap(hasAccess => {
              if (hasAccess) {
                return of(true);
              }

              if (viewRole === UserRole.PARTICIPANT) {
                /* First time room member -> add history entry */
                return this.roomService.getRoomByShortId(route.params.shortId).pipe(
                    tap(room => this.userService.addRoomToHistory(auth.userId, room.id).subscribe(() => {
                      const event = new MembershipsChanged();
                      this.eventService.broadcast(event.type, event.payload);
                    })),
                    map(room => true),
                    catchError(e => {
                      this.handleRoomNotFound();
                      return of(false);
                    })
                );
              } else {
                if (environment.debugOverrideRoomRole) {
                  /* DEBUG: Override role handling */
                  return of(true);
                }

                this.handleAccessDenied();
                return of(false);
              }
            })
        );
      }
    }));
  }

  handleAccessDenied() {
    this.translateService.get('errors.not-authorized').subscribe(msg => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    });
    this.router.navigateByUrl('');
  }

  handleRoomNotFound() {
    this.translateService.get('errors.room-not-found').subscribe(msg => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
      if (this.router.url !== '/user') {
        this.router.navigateByUrl('home');
      }
    });
  }
}
