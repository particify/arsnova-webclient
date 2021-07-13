import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IMessage } from '@stomp/stompjs';
import { TranslateService } from '@ngx-translate/core';
import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { EventService } from '../util/event.service';
import { NotificationService } from '../util/notification.service';
import { CacheKey, CachingService } from '../util/caching.service';
import { WsConnectorService } from '../websockets/ws-connector.service';
import { Entity } from '../../models/entity';
import { EntityChanged } from '../../models/events/entity-changed';
import { ChangeType, EntityChangeNotification } from '../../models/events/entity-change-notification';

const WS_DISCONNECT_GRACE_PERIOD_MS = 10 * 1000;

/**
 * A specialized version of BaseHttpService which manages persistent data which
 * can be referenced through an ID.
 */
export abstract class AbstractEntityService<T extends Entity> extends AbstractCachingHttpService<T> {
  private aliasIdMapping: Map<string, string> = new Map<string, string>();
  private stompSubscriptions = new Map<string, Subscription>();
  protected cacheName = 'entity';

  constructor(
    protected entityType: string,
    protected uriPrefix: string,
    protected httpClient: HttpClient,
    protected wsConnector: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    cachingService: CachingService,
    useSharedCache = true
  ) {
    super(uriPrefix, httpClient, wsConnector, eventService, translateService, notificationService, cachingService, useSharedCache);
    this.cache.registerDisposeHandler(this.cacheName, (id, value) =>
      this.handleCacheDisposeEvent(id, value));
    this.eventService.on<EntityChangeNotification>('EntityChangeNotification')
      .subscribe(event => this.handleEntityChangeNotificationEvent(event));
  }

  /**
   * Retrieves a single entity from the server.
   *
   * @param idOrAlias ID or alias of the entity
   * @param params Optional request parameters
   */
  getById(idOrAlias: string, params: { roomId?: string } = {}): Observable<T> {
    const id = this.resolveAlias(idOrAlias);
    const { roomId, ...queryParams } = params;
    const cachable = Object.keys(queryParams).length === 0;
    if (cachable) {
      const cachedEntity = this.cache.get(this.generateCacheKey(id));
      if (cachedEntity) {
        return of(cachedEntity);
      }
    }
    const uri = this.buildUri(`/${id}`, roomId);
    return this.httpClient.get<T>(uri, { params: new HttpParams(queryParams) }).pipe(
      tap(entity => cachable && this.handleEntityCaching(id, entity)));
  }

  /**
   * Retrieves a list of entities from the server.
   *
   * @param ids List of IDs of the entities
   * @param params Optional request parameters
   */
  getByIds(ids: string[], params: { roomId?: string } = {}): Observable<T[]> {
    const { roomId, ...queryParams } = params;
    const uri = this.buildUri(`/?ids=${ids.join(',')}`, roomId);
    return this.httpClient.get<T[]>(uri, { params: new HttpParams(queryParams) })
  }

  /**
   * Sends a POST requests with an entity to create it.
   *
   * @param entity The new entity
   * @param roomId The entity's room ID
   */
  postEntity(entity: T, roomId?: string): Observable<T> {
    if (entity.id) {
      throw new Error('Entity property "id" must not be set for new entities.');
    }
    const uri = this.buildUri('/', roomId);
    return this.httpClient.post<T>(uri, entity).pipe(
      tap(updatedEntity => this.handleEntityCaching(updatedEntity.id, updatedEntity)));
  }

  /**
   * Sends a PUT request with an existing entity to update it.
   *
   * @param entity The updated entity
   * @param roomId The entity's room ID
   */
  putEntity(entity: T, roomId?: string): Observable<T> {
    if (!entity.id) {
      throw new Error('Required entity property "id" is missing.');
    }
    const uri = this.buildUri(`/${entity.id}`, roomId);
    return this.httpClient.put<T>(uri, entity).pipe(
      tap(updatedEntity => this.handleEntityCaching(updatedEntity.id, updatedEntity)));
  }

  /**
   * Sends a PATCH request with the property changes to update an entity.
   *
   * @param idOrAlias ID or alias of the existing entity
   * @param changes An object with the requested property changes
   * @param roomId The entity's room ID
   */
  patchEntity(idOrAlias: string, changes: { [key: string]: any }, roomId?: string): Observable<T> {
    const uri = this.buildUri(`/${idOrAlias}`, roomId);
    return this.httpClient.patch<T>(uri, changes).pipe(
      tap(entity => this.handleEntityCaching(idOrAlias, entity)));
  }

  /**
   * Sends a DELETE request to delete an entity.
   *
   * @param id ID of the existing entity
   * @param roomId The entity's room ID
   */
  deleteEntity(id: string, roomId?: string): Observable<T> {
    const uri = this.buildUri(`/${id}`, roomId);
    return this.httpClient.delete<T>(uri).pipe(
      tap(() => this.cache.remove(this.generateCacheKey(id))));
  }

  protected handleEntityCaching(idOrAlias: string, entity: T) {
    if (idOrAlias !== entity.id) {
      this.aliasIdMapping.set(idOrAlias, entity.id);
    }
    const entityType = this.uriPrefix.replace(/\//, '');
    const roomId = entityType === 'room' ? entity.id : entity['roomId'];
    if (!this.stompSubscriptions.has(entity.id)) {
      const entityChanges$ = this.wsConnector.getWatcher(
        `/topic/${roomId}.${entityType}-${entity.id}.changes.stream`);
      this.stompSubscriptions.set(entity.id,
        entityChanges$.subscribe((msg) => this.handleEntityChangeEvent(entity.id, msg)));
    }
    this.cache.put(this.generateCacheKey(entity.id), entity)
  }

  protected generateCacheKey(id: string): CacheKey {
    return { type: `${this.cacheName}-${this.entityType}`, id: id };
  }

  private handleCacheDisposeEvent(id: string, value: object) {
    const subscription = this.stompSubscriptions.get(id);
    if (subscription) {
      this.stompSubscriptions.get(id).unsubscribe();
      this.stompSubscriptions.delete(id);
    }
  }

  private handleEntityChangeEvent(id: string, msg: IMessage) {
    const changes: object = JSON.parse(msg.body);
    const entity = this.cache.get(this.generateCacheKey(id));
    this.mergeChangesRecursively(entity, changes);
    const event = new EntityChanged<T>(this.entityType, entity, Object.keys(changes));
    this.eventService.broadcast(event.type, event.payload);
  }

  private handleEntityChangeNotificationEvent(event: EntityChangeNotification) {
    if (event.payload.changeType === ChangeType.DELETE) {
      this.cache.remove(this.generateCacheKey(event.payload.id));
    }
  }

  private mergeChangesRecursively(originalObject: object, changes: object) {
    for (const [key, value] of Object.entries(changes)) {
      if (value && typeof value === 'object' && !(value instanceof Array)) {
        if (!originalObject[key]) {
          originalObject[key] = {};
        }
        this.mergeChangesRecursively(originalObject[key], value);
      } else {
        originalObject[key] = value;
      }
    }
  }

  private resolveAlias(idOrAlias: string): string {
    return this.aliasIdMapping.get(idOrAlias) ?? idOrAlias;
  }
}
