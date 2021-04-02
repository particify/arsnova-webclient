import { Injectable } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SnackBarAdvancedComponent } from '../components/shared/snack-bar-advanced/snack-bar-advanced.component';
import { ApiConfig } from '../models/api-config';
import { ApiConfigService } from '../services/http/api-config.service';
import { AdvancedSnackBarTypes, NotificationService } from '../services/util/notification.service';

@Injectable()
export class ApiConfigResolver implements Resolve<ApiConfig> {
  constructor(
    private apiConfigService: ApiConfigService,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApiConfig> {
    let snackbarRef: MatSnackBarRef<SnackBarAdvancedComponent>;
    const config$ = this.apiConfigService.getApiConfig$().pipe(
      tap(() => snackbarRef?.dismiss()));
    // Show a snackbar if the config is not loaded within one second.
    timer(1000).pipe(
      takeUntil(config$),
      tap(() => {
        this.translateService.get('errors.establishing-connection').subscribe(msg =>
          snackbarRef = this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.LOADING));
      }))
      .subscribe();
    return config$;
  }
}
