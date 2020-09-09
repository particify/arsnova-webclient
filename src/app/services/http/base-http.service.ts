import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../util/notification.service';

@Injectable()
export class BaseHttpService {

  constructor(
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.translateService.get('errors.something-went-wrong').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
      });
      return throwError(error);
    };
  }
}
