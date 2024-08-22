import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class DefaultHeaderInterceptor implements HttpInterceptor {
  constructor(private translateService: TranslocoService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const requestWithHeaders = req.clone({
      headers: req.headers.set(
        'Accept-Language',
        this.translateService.getActiveLang()
      ),
    });
    return next.handle(requestWithHeaders);
  }
}
