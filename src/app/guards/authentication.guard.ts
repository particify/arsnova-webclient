import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/http/authentication.service';


import { NotificationService } from '../services/util/notification.service';
import { UserRole } from '../models/user-roles.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean {
    // Get roles having access to this route
    // undefined if every logged in user should have access regardless of its role
    const requiredRoles = route.data['roles'] as Array<UserRole>;
    // Allow access when user is logged in AND
    // the route doesn't require a specific role OR
    // the user's role is one of the required roles
    if (requiredRoles && this.authenticationService.hasAccess(route.params.shortId, requiredRoles[0])) {
      return true;
    } else if (this.authenticationService.isLoggedIn() && !requiredRoles) {
      return true;
    }

    this.translateService.get('errors.not-authorized').subscribe(msg => {
      this.notificationService.show(msg);
    });
    // TODO: redirect to error page
    this.router.navigate(['/']);
    return false;
  }
}
