import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthenticationService } from '../services/http/authentication.service';
import { NotificationService } from '../services/util/notification.service';
import { UserRole } from '../models/user-roles.enum';
import { TranslateService } from '@ngx-translate/core';
import { RoomMembershipService } from '../services/room-membership.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private roomMembershipService: RoomMembershipService,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> {
    // Get roles having access to this route
    // undefined if every logged in user should have access regardless of its role
    const viewRole = route.data['requiredRole'] as UserRole;
    // Allow access when user is logged in AND
    // the route doesn't require a specific role OR
    // the user's role is one of the required roles
    return this.authenticationService.getAuthenticationChanges().pipe(switchMap(auth => {
      if (!auth) {
        this.handleAccessDenied();
        return of(false);
      }

      if (!viewRole) {
        return of(true);
      } else {
        return this.roomMembershipService.hasAccessForRoom(route.params.shortId, viewRole).pipe(
            tap(hasAccess => {
              if (!hasAccess) {
                this.handleAccessDenied();
              }
            }));
      }
    }));
  }

  handleAccessDenied() {
    this.translateService.get('errors.not-authorized').subscribe(msg => {
      this.notificationService.show(msg);
    });
    // TODO: redirect to error page
    this.router.navigate(['/']);
  }
}
