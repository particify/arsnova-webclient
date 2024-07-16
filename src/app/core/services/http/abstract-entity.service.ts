import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IMessage } from '@stomp/stompjs';
import { TranslocoService } from '@ngneat/transloco';
import { AbstractCachingHttpService } from './abstract-caching-http.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  CacheKey,
  CachingService,
} from '@app/core/services/util/caching.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Entity } from '@app/core/models/entity';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import {
  ChangeType,
  EntityChangeNotification,
} from '@app/core/models/events/entity-change-notification';

const PARTITION_SIZE = 50;
const CACHE_NAME_PREFIX = 'entity-';

/**
 * A specialized version of BaseHttpService which manages persistent data which
 * can be referenced through an ID.
 */
export abstract class AbstractEntityService<
  T extends Entity,
> extends AbstractCachingHttpService<T> {
  private aliasIdMapping: Map<string, string> = new Map<string, string>();
  private stompSubscriptions = new Map<string, Subscription>();
  protected readonly cacheName;

  constructor(
    protected entityType: string,
    protected uriPrefix: string,
    protected httpClient: HttpClient,
    protected wsConnector: WsConnectorService,
    protected eventService: EventService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    cachingService: CachingService,
    private useChangeSubscriptions = true
  ) {
    super(
      uriPrefix,
      httpClient,
      wsConnector,
      eventService,
      translateService,
      notificationService,
      cachingService,
      useChangeSubscriptions
    );
    this.cacheName = CACHE_NAME_PREFIX + entityType;
    this.cache.registerDisposeHandler(this.cacheName, (id) =>
      this.handleCacheDisposeEvent(id)
    );
    this.eventService
      .on<EntityChangeNotification>('EntityChangeNotification')
      .subscribe((event) => this.handleEntityChangeNotificationEvent(event));
  }

  /**
   * Retrieves a single entity from the server.
   *
   * @param idOrAlias ID or alias of the entity
   * @param params Optional request parameters
   */
  getById(
    idOrAlias: string,
    params: Record<string, string> = {}
  ): Observable<T> {
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
    return this.fetchOnce<T>(
      uri,
      new HttpParams({ fromObject: queryParams })
    ).pipe(tap((entity) => cachable && this.handleEntityCaching(id, entity)));
  }

  /**
   * Retrieves a list of entities from the server.
   *
   * @param ids List of IDs of the entities
   * @param params Optional request parameters
   */
  getByIds(
    ids: string[],
    params: Record<string, string> = {}
  ): Observable<T[]> {
    const { roomId, ...queryParams } = params;
    const cachable = Object.keys(queryParams).length === 0;
    const entities: T[] = [];
    const missingIds: string[] = [];

    if (!cachable) {
      return this.fetchPartitionedByIds(ids, roomId, queryParams);
    }

    for (const id of ids) {
      const cachedEntity = this.cache.get(this.generateCacheKey(id));
      if (cachedEntity) {
        entities.push(cachedEntity);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      return of(entities);
    }

    const uncachedEntites$ = this.fetchPartitionedByIds(
      missingIds,
      roomId,
      queryParams
    );

    // Merge lists of cached and uncached entities and ensure that the original
    // order is maintained.
    return uncachedEntites$.pipe(
      tap((uncachedEntites) =>
        uncachedEntites.forEach((e) => this.handleEntityCaching(e.id, e))
      ),
      map((uncachedEntites) =>
        ids.map(
          (id) =>
            (entities.find((e) => e.id === id) ??
              uncachedEntites.find((e) => e.id === id)) as T
        )
      )
    );
  }

  private fetchPartitionedByIds(
    ids: string[],
    roomId?: string,
    queryParams: Record<string, string> = {}
  ): Observable<T[]> {
    const partitionedIds: string[][] = [];
    for (let i = 0; i < ids?.length; i += PARTITION_SIZE) {
      partitionedIds.push(ids.slice(i, i + PARTITION_SIZE));
    }
    const partitionedEntities$: Observable<T[]>[] = partitionedIds.map(
      (ids) => {
        const uri = this.buildUri(`/?ids=${ids.join(',')}`, roomId);
        return this.fetchOnce<T[]>(
          uri,
          new HttpParams({ fromObject: queryParams })
        );
      }
    );

    return forkJoin(partitionedEntities$).pipe(
      map((results) =>
        results.reduce((acc: T[], value: T[]) => acc.concat(value), [])
      )
    );
  }

  /**
   * Sends a POST requests with an entity to create it.
   *
   * @param entity The new entity
   * @param roomId The entity's room ID
   */
  postEntity(entity: Omit<T, 'id'>, roomId?: string): Observable<T> {
    const uri = this.buildUri('/', roomId);
    return this.requestOnce('POST', uri, entity).pipe(
      tap((updatedEntity) =>
        this.handleEntityCaching(updatedEntity.id, updatedEntity)
      )
    );
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
    return this.requestOnce('PUT', uri, entity).pipe(
      tap((updatedEntity) =>
        this.handleEntityCaching(updatedEntity.id, updatedEntity)
      )
    );
  }

  /**
   * Sends a PATCH request with the property changes to update an entity.
   *
   * @param idOrAlias ID or alias of the existing entity
   * @param changes An object with the requested property changes
   * @param roomId The entity's room ID
   */
  patchEntity(
    idOrAlias: string,
    changes: Partial<T>,
    roomId?: string
  ): Observable<T> {
    const uri = this.buildUri(`/${idOrAlias}`, roomId);
    return this.requestOnce('PATCH', uri, changes as T).pipe(
      tap((entity) => this.handleEntityCaching(idOrAlias, entity))
    );
  }

  /**
   * Sends a DELETE request to delete an entity.
   *
   * @param id ID of the existing entity
   * @param roomId The entity's room ID
   */
  deleteEntity(id: string, roomId?: string): Observable<T> {
    const uri = this.buildUri(`/${id}`, roomId);
    return this.requestOnce('DELETE', uri).pipe(
      tap(() => this.cache.remove(this.generateCacheKey(id)))
    );
  }

  protected handleEntityCaching(idOrAlias: string, entity: T) {
    if (idOrAlias !== entity.id) {
      this.aliasIdMapping.set(idOrAlias, entity.id);
    }
    const entityType = this.uriPrefix.replace(/\//, '');
    const roomId =
      entityType === 'room' ? entity.id : entity['roomId' as keyof T];
    if (
      this.useChangeSubscriptions &&
      !this.stompSubscriptions.has(entity.id)
    ) {
      const entityChanges$ = this.wsConnector.getWatcher(
        `/topic/${roomId}.${entityType}-${entity.id}.changes.stream`
      );
      this.stompSubscriptions.set(
        entity.id,
        entityChanges$.subscribe((msg) =>
          this.handleEntityChangeEvent(entity.id, msg)
        )
      );
    }
    this.cache.put(this.generateCacheKey(entity.id), entity);
  }

  protected generateCacheKey(id: string): CacheKey {
    return { type: `${this.cacheName}`, id: id };
  }

  private handleCacheDisposeEvent(id: string) {
    const subscription = this.stompSubscriptions.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.stompSubscriptions.delete(id);
    }
  }

  private handleEntityChangeEvent(id: string, msg: IMessage) {
    const changes: object = JSON.parse(msg.body);
    const entity = this.cache.get(this.generateCacheKey(id)) as T;
    this.mergeChangesRecursively(entity, changes);
    const event = new EntityChanged<T>(
      this.entityType,
      entity,
      Object.keys(changes)
    );
    this.eventService.broadcast(event.type, event.payload);
  }

  private handleEntityChangeNotificationEvent(event: EntityChangeNotification) {
    if (
      event.payload.changeType === ChangeType.DELETE ||
      !this.stompSubscriptions.has(event.payload.id)
    ) {
      this.cache.remove(this.generateCacheKey(event.payload.id));
    }
  }

  private mergeChangesRecursively(originalObject: object, changes: object) {
    for (const [key, value] of Object.entries(changes)) {
      if (value && typeof value === 'object' && !(value instanceof Array)) {
        if (!originalObject[key as keyof object]) {
          (originalObject as { [key: string]: object })[key] = {};
        }
        this.mergeChangesRecursively(
          originalObject[key as keyof object],
          value
        );
      } else {
        (originalObject as { [key: string]: object })[key] = value;
      }
    }
  }

  private resolveAlias(idOrAlias: string): string {
    return this.aliasIdMapping.get(idOrAlias) ?? idOrAlias;
  }
}
