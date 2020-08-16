import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';

import { AuthenticationService, AUTH_HEADER_KEY, AUTH_SCHEME } from '../services/http/authentication.service';
import { NotificationService } from '../services/util/notification.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private token: string;

  constructor(private authenticationService: AuthenticationService,
              private notificationService: NotificationService,
              private router: Router) {
    authenticationService.getAuthenticationChanges().subscribe(auth => this.token = auth?.token);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.token || req.headers.has(AUTH_HEADER_KEY)) {
      const authReq = req.headers.has(AUTH_HEADER_KEY) ? req : req.clone({
        headers: req.headers.set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${this.token}`)
      });

      return next.handle(authReq).pipe(tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Possible to do something with the response here
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          // Catch 401 errors
          if (err.status === 401) {
            this.notificationService.show('You are not logged in');
            this.router.navigate(['home']);
          }
        }
      }));
    } else {
      return next.handle(req);
    }
  }
}
