import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';

import { AuthenticationService, AUTH_HEADER_KEY, AUTH_SCHEME } from '../services/http/authentication.service';
import { AdvancedSnackBarTypes, NotificationService } from '../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RoutingService } from '../services/util/routing.service';

const API_LOGIN_URI_PATTERN = /^\/api\/auth\/login\/[^?].*/;

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private token: string;

  constructor(
      private authenticationService: AuthenticationService,
      private router: Router,
      private notificationService: NotificationService,
      private translateService: TranslateService,
      private routingService: RoutingService
  ) {
    authenticationService.getAuthenticationChanges().subscribe(auth => this.token = auth?.token);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenOverride = req.headers.has(AUTH_HEADER_KEY);
    if (new URL(req.url, location.origin).origin === location.origin
        && (this.token || tokenOverride)
        && !req.withCredentials
        && !API_LOGIN_URI_PATTERN.test(req.url)) {
      const authReq = tokenOverride ? req : req.clone({
        headers: req.headers.set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${this.token}`)
      });

      return next.handle(authReq).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Possible to do something with the response here
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401 && !tokenOverride) {
          this.authenticationService.logout();
          this.routingService.setRedirect();
          this.router.navigateByUrl('login');
          this.translateService.get('login.authentication-expired').subscribe(msg => {
            this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
          });
        }
      }));
    } else {
      return next.handle(req);
    }
  }
}
