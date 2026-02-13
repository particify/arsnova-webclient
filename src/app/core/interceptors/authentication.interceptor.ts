import { catchError, switchMap } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  AuthenticationService,
  AUTH_HEADER_KEY,
  AUTH_SCHEME,
} from '@app/core/services/http/authentication.service';
import { Observable, of } from 'rxjs';

const REFRESH_URI = '/api/auth/refresh';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private authenticationService = inject(AuthenticationService);
  private http = inject(HttpClient);

  private readonly token = this.authenticationService.accessToken;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tokenOverride = req.headers.has(AUTH_HEADER_KEY);
    const token = this.token();
    if (
      new URL(req.url, location.origin).origin === location.origin &&
      token &&
      !tokenOverride &&
      !req.withCredentials &&
      req.url !== REFRESH_URI
    ) {
      const authReq = this.buildAuthenticatedRequest(req);
      return next.handle(authReq).pipe(
        catchError((err) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            if (
              authReq.headers.get(AUTH_HEADER_KEY) !==
              `${AUTH_SCHEME} ${this.token()}`
            ) {
              // Access token expired but has been refreshed in the meantime.
              return this.http.request(this.buildAuthenticatedRequest(req));
            }
            return this.authenticationService.handleUnauthorizedError().pipe(
              switchMap(() => {
                const retryReq = this.buildAuthenticatedRequest(req);
                return this.http.request(retryReq);
              })
            );
          }
          return of(err);
        })
      );
    } else {
      return next.handle(req);
    }
  }

  private buildAuthenticatedRequest(req: HttpRequest<any>): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set(
        AUTH_HEADER_KEY,
        `${AUTH_SCHEME} ${this.token()}`
      ),
    });
  }
}
