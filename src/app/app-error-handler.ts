import { ErrorHandler, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private _uiErrorCount$ = new BehaviorSubject(0);
  private _httpErrorCount$ = new BehaviorSubject(0);

  handleError(error: any): void {
    if (error.stack) {
      this._uiErrorCount$.next(this._uiErrorCount$.getValue() + 1);
    } else if (error.status !== undefined) {
      this._httpErrorCount$.next(this._httpErrorCount$.getValue() + 1);
    }
    throw error;
  }

  get uiErrorCount$(): Observable<number> {
    return this._uiErrorCount$;
  }

  get httpErrorCount$(): Observable<number> {
    return this._httpErrorCount$;
  }
}
