import { HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import {
  Cache,
  CacheKey,
  CachingService,
  DefaultCache,
} from '@app/core/services/util/caching.service';
import {
  AbstractHttpService,
  HttpOptions,
  HttpMethod,
} from './abstract-http.service';

export abstract class AbstractCachingHttpService<
  T,
> extends AbstractHttpService<T> {
  protected cachingService = inject(CachingService);
  protected cacheName = 'http';
  protected stompSubscription?: Subscription;
  protected cache: Cache<T>;
  private inflightRequests = new Map<string, Observable<T | T[]>>();

  constructor(uriPrefix: string, useSharedCache = false) {
    super(uriPrefix);
    this.cache = this.cachingService.getCache<T>(
      useSharedCache ? DefaultCache.SHARED : DefaultCache.CURRENT_ROOM
    );
  }

  /**
   * Performs a HTTP GET request and caches the Observable while the request is
   * in flight. If a GET request with identical URI and params is already in
   * flight, the cached Observable is returned.
   */
  protected fetchOnce<U extends T | T[] = T>(
    uri: string,
    params?: HttpParams
  ): Observable<U> {
    return this.requestOnce('GET', uri, undefined, { params: params });
  }

  /**
   * Performs a HTTP request and caches the Observable while the request is in
   * flight. If an request with identical method, URI, params and body is
   * already in flight, the cached Observable is returned.
   */
  protected requestOnce<U extends T | T[] = T>(
    method: HttpMethod,
    uri: string,
    body?: T | Omit<T, 'id'>,
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
    if (options?.params) {
      key += '?' + options.params.toString();
    }
    if (options?.body != null) {
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
