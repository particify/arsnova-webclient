import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, pipe, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { HttpRequestFailed } from '@app/core/models/events/http-request-failed';
import { retryBackoff } from 'backoff-rxjs';

function defaultRetryBackoff(initialInterval = 3000) {
  return pipe(
    retryBackoff({
      initialInterval: initialInterval,
      maxRetries: 5,
      shouldRetry: (error) => (error as HttpErrorResponse).status >= 500,
    })
  );
}

type HttpOptions = {
  params?: HttpParams;
  headers?: HttpHeaders;
  retry?: boolean;
  retryInitialInterval?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class AbstractHttpService<T> {
  protected apiUrl = {
    base: '/api',
    find: '/find',
    room: '/room',
  };

  constructor(
    protected uriPrefix: string,
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService
  ) {}

  /**
   * Performs a HTTP GET request. By default, if the request fails, it is send
   * again up to 5 times with exponential backoff delay.
   */
  protected performGet<U extends T | T[]>(
    uri: string,
    options?: HttpOptions
  ): Observable<U> {
    return this.performGenericGet(uri, options);
  }

  protected performForeignGet<U>(
    uri: string,
    options?: HttpOptions
  ): Observable<U> {
    return this.performGenericGet(uri, options);
  }

  private performGenericGet<U>(
    uri: string,
    options?: HttpOptions
  ): Observable<U> {
    const request$ = this.httpClient.get<U>(uri, options);
    return options?.retry ?? true
      ? request$.pipe(defaultRetryBackoff(options?.retryInitialInterval))
      : request$;
  }

  /**
   * Performs a HTTP POST request. If options.retry is true, the request will be
   * send again up to 5 times with exponential backoff delay on failure.
   */
  protected performPost<U extends T | T[]>(
    uri: string,
    body: U,
    options?: HttpOptions
  ): Observable<U> {
    return this.performGenericPost(uri, body, options);
  }

  protected performForeignPost<U>(
    uri: string,
    body: any,
    options?: HttpOptions
  ): Observable<U> {
    return this.performGenericPost(uri, body, options);
  }

  private performGenericPost<U>(
    uri: string,
    body: any,
    options?: HttpOptions
  ): Observable<U> {
    const request$ = this.httpClient.post<U>(uri, body, options);
    return options?.retry ?? true
      ? request$.pipe(defaultRetryBackoff(options?.retryInitialInterval))
      : request$;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      let message = null;
      switch (error?.status) {
        case 401:
          // NOOP
          break;
        case 429:
          message = 'errors.http-too-many-requests';
          break;
        default:
          message = 'errors.something-went-wrong';
          break;
      }
      if (message) {
        this.translateService.get(message).subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.FAILED
          );
        });
      }

      const event = new HttpRequestFailed(
        error.status,
        error.statusText,
        error.url
      );
      this.eventService.broadcast(event.type, event.payload);

      return throwError(error);
    };
  }

  /** Builds an URI for an endpoint which is related to this service's domain
   * and shares its common prefix. */
  buildUri(path: string, roomId?: string) {
    return this.getBaseUrl(roomId) + this.uriPrefix + path;
  }

  /** Builds an URI for an endpoint that does not use the common URI prefix of
   * this service. */
  buildForeignUri(path: string, roomId?: string) {
    return this.getBaseUrl(roomId) + path;
  }

  private getBaseUrl(roomId?: string): string {
    return this.apiUrl.base + (roomId ? this.apiUrl.room + '/' + roomId : '');
  }
}
