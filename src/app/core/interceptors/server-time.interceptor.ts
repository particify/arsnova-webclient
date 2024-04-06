import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ServerTimeService } from '@app/core/services/util/server-time.service';

@Injectable()
export class ServerTimeInterceptor implements HttpInterceptor {
  constructor(private serverTimeService: ServerTimeService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const requestTime = Date.now();
    return next.handle(request).pipe(
      tap((e: HttpEvent<unknown>): void => {
        const url = new URL(request.url, location.origin);
        if (
          url.origin === location.origin &&
          url.pathname.startsWith('/api/') &&
          e instanceof HttpResponse &&
          e.headers.has('Date')
        ) {
          this.calculateAndUpdateOffset(
            requestTime,
            new Date(e.headers.get('Date') as string).getTime()
          );
        }
      })
    );
  }

  private calculateAndUpdateOffset(requestTime: number, serverTime: number) {
    const responseTime = Date.now();
    const latency = (responseTime - requestTime) * 0.5;
    // Add 500 because the Date header does not include ms and is always rounded down.
    const offset = serverTime + latency + 500 - responseTime;
    this.serverTimeService.updateAverageOffset(offset);
  }
}
