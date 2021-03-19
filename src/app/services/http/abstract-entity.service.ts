import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AbstractHttpService } from './abstract-http.service';
import { EventService } from '../util/event.service';
import { NotificationService } from '../util/notification.service';
import { Entity } from '../../models/entity';

/**
 * A specialized version of BaseHttpService which manages persistent data which
 * can be referenced through an ID.
 */
export abstract class AbstractEntityService<T extends Entity> extends AbstractHttpService<T> {
  constructor(
    uriPrefix: string,
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super(uriPrefix, httpClient, eventService, translateService, notificationService);
  }

  /**
   * Retrieves a single entity from the server.
   *
   * @param id ID of the entity
   * @param params Optional request parameters
   */
  getById(id: string, params: { roomId?: string } = {}): Observable<T> {
    const { roomId, ...queryParams } = params;
    const uri = this.buildUri(`/${id}`, roomId);
    return this.httpClient.get<T>(uri, { params: new HttpParams(queryParams) })
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
    return this.httpClient.post<T>(uri, entity);
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
    return this.httpClient.put<T>(uri, entity);
  }

  /**
   * Sends a PATCH request with the property changes to update an entity.
   *
   * @param id ID of the existing entity
   * @param changes An object with the requested property changes
   * @param roomId The entity's room ID
   */
  patchEntity(id: string, changes: { [key: string]: any }, roomId?: string): Observable<T> {
    const uri = this.buildUri(`/${id}`, roomId);
    return this.httpClient.patch<T>(uri, changes);
  }

  /**
   * Sends a DELETE request to delete an entity.
   *
   * @param id ID of the existing entity
   * @param roomId The entity's room ID
   */
  deleteEntity(id: string, roomId?: string): Observable<T> {
    const uri = this.buildUri(`/${id}`, roomId);
    return this.httpClient.delete<T>(uri);
  }
}
