import { ErrorHandler, inject, Injectable } from '@angular/core';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private storage = inject(GlobalStorageService);
  private _uiErrorCount$ = new BehaviorSubject(0);
  private _httpErrorCount$ = new BehaviorSubject(0);

  constructor() {
    const uiErrorCount = this.storage.getItem(STORAGE_KEYS.UI_ERROR_COUNT);
    const httpErrorCount = this.storage.getItem(STORAGE_KEYS.HTTP_ERROR_COUNT);
    if (uiErrorCount) {
      this._uiErrorCount$.next(+uiErrorCount);
    }
    if (httpErrorCount) {
      this._httpErrorCount$.next(+httpErrorCount);
    }
  }

  handleError(error: any): void {
    if (error.stack) {
      const uiErrorCount = this._uiErrorCount$.getValue() + 1;
      this.storage.setItem(
        STORAGE_KEYS.UI_ERROR_COUNT,
        uiErrorCount.toString()
      );
      this._uiErrorCount$.next(uiErrorCount);
    } else if (error.status !== undefined) {
      const httpErrorCount = this._httpErrorCount$.getValue() + 1;
      this.storage.setItem(
        STORAGE_KEYS.HTTP_ERROR_COUNT,
        httpErrorCount.toString()
      );
      this._httpErrorCount$.next(this._httpErrorCount$.getValue() + 1);
    }
    console.error(error);
  }

  get uiErrorCount$(): Observable<number> {
    return this._uiErrorCount$;
  }

  get httpErrorCount$(): Observable<number> {
    return this._httpErrorCount$;
  }

  reset() {
    this._uiErrorCount$.next(0);
    this._httpErrorCount$.next(0);
    this.storage.removeItem(STORAGE_KEYS.UI_ERROR_COUNT);
    this.storage.removeItem(STORAGE_KEYS.HTTP_ERROR_COUNT);
  }
}
