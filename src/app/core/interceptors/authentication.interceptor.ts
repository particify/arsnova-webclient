import { tap } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  AuthenticationService,
  AUTH_HEADER_KEY,
  AUTH_SCHEME,
} from '@app/core/services/http/authentication.service';
import { Observable } from 'rxjs';

const API_LOGIN_URI_PATTERN = /^\/api\/auth\/login\/[^?].*/;

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private authenticationService = inject(AuthenticationService);

  private token?: string;

  constructor() {
    const authenticationService = this.authenticationService;

    authenticationService
      .getAuthenticationChanges()
      .subscribe((auth) => (this.token = auth?.token));
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokenOverride = req.headers.has(AUTH_HEADER_KEY);
    if (
      new URL(req.url, location.origin).origin === location.origin &&
      (this.token || tokenOverride) &&
      !req.withCredentials &&
      !API_LOGIN_URI_PATTERN.test(req.url)
    ) {
      const authReq = tokenOverride
        ? req
        : req.clone({
            headers: req.headers.set(
              AUTH_HEADER_KEY,
              `${AUTH_SCHEME} ${this.token}`
            ),
          });

      return next.handle(authReq).pipe(
        tap(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              // Possible to do something with the response here
            }
          },
          (err: any) => {
            if (
              err instanceof HttpErrorResponse &&
              err.status === 401 &&
              !tokenOverride
            ) {
              this.authenticationService.handleUnauthorizedError();
            }
          }
        )
      );
    } else {
      return next.handle(req);
    }
  }
}
