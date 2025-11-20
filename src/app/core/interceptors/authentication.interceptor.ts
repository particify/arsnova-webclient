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

const REFRESH_URI = '/api/auth/refresh';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private authenticationService = inject(AuthenticationService);

  private readonly token = this.authenticationService.accessToken;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokenOverride = req.headers.has(AUTH_HEADER_KEY);
    const token = this.token();
    if (
      new URL(req.url, location.origin).origin === location.origin &&
      (token || tokenOverride) &&
      !req.withCredentials &&
      req.url !== REFRESH_URI
    ) {
      const authReq = tokenOverride
        ? req
        : req.clone({
            headers: req.headers.set(
              AUTH_HEADER_KEY,
              `${AUTH_SCHEME} ${token}`
            ),
          });

      return next.handle(authReq).pipe(
        tap({
          next: (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              // Possible to do something with the response here
            }
          },
          error: (err: any) => {
            if (
              err instanceof HttpErrorResponse &&
              err.status === 401 &&
              !tokenOverride
            ) {
              this.authenticationService.handleUnauthorizedError();
            }
          },
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
