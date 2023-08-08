import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import {
  Cache,
  CacheKey,
  CachingService,
  DefaultCache,
} from '@app/core/services/util/caching.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import {
  AbstractHttpService,
  HttpOptions,
  HttpMethod,
} from './abstract-http.service';

export abstract class AbstractCachingHttpService<
  T,
> extends AbstractHttpService<T> {
  protected cacheName = 'http';
  protected stompSubscription: Subscription;
  protected cache: Cache<T>;
  private inflightRequests = new Map<string, Observable<T | T[]>>();

  constructor(
    uriPrefix: string,
    httpClient: HttpClient,
    protected wsConnector: WsConnectorService,
    eventService: EventService,
    translateService: TranslateService,
    notificationService: NotificationService,
    protected cachingService: CachingService,
    useSharedCache = false
  ) {
    super(
      uriPrefix,
      httpClient,
      eventService,
      translateService,
      notificationService
    );
    this.cache = cachingService.getCache<T>(
      useSharedCache ? DefaultCache.SHARED : DefaultCache.CURRENT_ROOM
    );
  }

  /**
   * Performs a HTTP GET request and caches the Observable while the request is
   * in flight. If a GET request with identical URI and params is already in
   * flight, the cached Observable is returned.
   */
  protected fetchOnce<U extends T | T[]>(
    uri: string,
    params?: HttpParams
  ): Observable<U> {
    return this.requestOnce('GET', uri, null, { params: params });
  }

  /**
   * Performs a HTTP request and caches the Observable while the request is in
   * flight. If an request with identical method, URI, params and body is
   * already in flight, the cached Observable is returned.
   */
  protected requestOnce<U extends T | T[]>(
    method: HttpMethod,
    uri: string,
    body: U,
    options: Omit<HttpOptions, 'body'> = {}
  ): Observable<U> {
    (options as HttpOptions).body = body;
    const key = this.generateRequestKey(method, uri, options);
    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key) as Observable<U>;
    }
    const request$ = this.performRequest<U>(method, uri, body, options).pipe(
      tap(() => this.inflightRequests.delete(key)),
      share()
    );
    this.inflightRequests.set(key, request$);

    return request$;
  }

  private generateRequestKey(
    method: HttpMethod,
    uri: string,
    options?: HttpOptions
  ): string {
    let key = `${method}\n${uri}`;
    if (options.params) {
      key += '?' + options.params.toString();
    }
    if (options.body != null) {
      key += '\n' + JSON.stringify(options.body);
    }

    return key;
  }

  /**
   * Performs a HTTP GET request and caches the response. If a cached response
   * already exists, it is returned without performing a new request.
   */
  protected fetchWithCache(uri: string): Observable<T> {
    const cachedObject = this.cache.get(this.generateCacheKey(uri));
    if (cachedObject) {
      return of(cachedObject);
    }
    const request$ = this.fetchOnce<T>(uri).pipe(
      tap((object) => this.handleObjectCaching(uri, object))
    );

    return request$;
  }

  protected generateCacheKey(id: string): CacheKey {
    return { type: `${this.cacheName}-${this.uriPrefix}`, id: id };
  }

  protected handleObjectCaching(uri: string, data: T) {
    this.cache.put(this.generateCacheKey(uri), data);
  }
}
