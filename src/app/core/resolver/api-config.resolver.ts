import { Injectable, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { Resolve } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, timer } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { SnackBarAdvancedComponent } from '@app/core/components/snack-bar-advanced/snack-bar-advanced.component';
import { ApiConfig } from '@app/core/models/api-config';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';

@Injectable()
export class ApiConfigResolver implements Resolve<ApiConfig> {
  private apiConfigService = inject(ApiConfigService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);

  resolve(): Observable<ApiConfig> {
    let snackbarRef: MatSnackBarRef<SnackBarAdvancedComponent>;
    const config$ = this.apiConfigService
      .getApiConfig$()
      .pipe(tap(() => snackbarRef?.dismiss()));
    // Show a snackbar if the config is not loaded within one second.
    timer(1000)
      .pipe(
        takeUntil(config$),
        tap(() => {
          this.translateService
            .selectTranslate('errors.establishing-connection')
            .pipe(take(1))
            .subscribe(
              (msg) =>
                (snackbarRef = this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.LOADING
                ))
            );
        })
      )
      .subscribe();
    return config$;
  }
}
