import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';
import { HttpRequestFailed } from '../../models/events/http-request-failed';

@Injectable()
export class BaseHttpService {

  constructor(
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
}
