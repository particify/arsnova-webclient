import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { HttpRequestFailed } from '../../models/events/http-request-failed';

export abstract class AbstractHttpService<T> {
  protected apiUrl = {
    base: '/api',
    find: '/find',
    room: '/room'
  };

  constructor(
    protected uriPrefix: string,
    protected httpClient: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
  }

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
        this.translateService.get(message).subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
        });
      }

      const event = new HttpRequestFailed(error.status, error.statusText, error.url);
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
    return this.apiUrl.base + (roomId ? (this.apiUrl.room + '/' + roomId) : '');
  }
}
