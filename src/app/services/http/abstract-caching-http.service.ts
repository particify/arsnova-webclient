import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache, CacheKey, CachingService, DefaultCache } from '../util/caching.service';
import { EventService } from '../util/event.service';
import { NotificationService } from '../util/notification.service';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { AbstractHttpService } from './abstract-http.service';

export abstract class AbstractCachingHttpService<T> extends AbstractHttpService<T> {
  protected cacheName = 'http';
  protected stompSubscription: Subscription;
  protected cache: Cache;

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
    super(uriPrefix, httpClient, eventService, translateService, notificationService);
    this.cache = cachingService.getCache(useSharedCache ? DefaultCache.SHARED : DefaultCache.CURRENT_ROOM);
  }

  protected fetch(uri: string): Observable<T> {
    const cachedObject = this.cache.get(this.generateCacheKey(uri));
    if (cachedObject) {
      return of(cachedObject);
    }
    return this.httpClient.get<T>(uri).pipe(
        tap(object => this.handleObjectCaching(uri, object)));
  }

  protected generateCacheKey(id: string): CacheKey {
    return { type: `${this.cacheName}-${this.uriPrefix}`, id: id };
  }

  protected handleObjectCaching(uri: string, data: T) {
    this.cache.put(this.generateCacheKey(uri), data);
  }
}
