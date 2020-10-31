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
      if (error?.status !== 401) {
        this.translateService.get('errors.something-went-wrong').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
        });
      }

      const event = new HttpRequestFailed(error.status, error.statusText, error.url);
      this.eventService.broadcast(event.type, event.payload);

      return throwError(error);
    };
  }
}
