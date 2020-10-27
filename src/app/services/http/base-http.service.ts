import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../util/notification.service';

@Injectable()
export class BaseHttpService {

  protected apiUrl = {
    base: '/api',
    find: '/find',
    room: '/room',
    stats: '/stats',
    user: '/user',
  };

  constructor(
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
      return throwError(error);
    };
  }

  getBaseUrl(roomId?: string): string {
    return this.apiUrl.base + (roomId ? (this.apiUrl.room + '/' + roomId) : '');
  }
}
