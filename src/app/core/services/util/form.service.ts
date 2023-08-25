import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  formDisabled$ = new Subject<boolean>();

  getFormDisabled(): Subject<boolean> {
    return this.formDisabled$;
  }

  enableForm(): void {
    this.formDisabled$.next(false);
  }

  disableForm(): void {
    this.formDisabled$.next(true);
  }
}
