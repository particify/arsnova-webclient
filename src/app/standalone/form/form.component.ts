import { Component, OnDestroy, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormService } from '@app/core/services/util/form.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  template: '',
})
export abstract class FormComponent implements OnDestroy {
  protected destroyed$ = new Subject<void>();
  private formControl: FormControl;
  formDisabled = false;

  constructor(protected formService: FormService) {
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.enableForm();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private subscribeToFormChanges(): void {
    this.formService
      .getFormDisabled()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((formDisabled) => {
        this.formDisabled = formDisabled;
        this.handleFormChanges();
      });
  }

  protected handleFormChanges(): void {
    if (this.formControl) {
      if (this.formDisabled) {
        this.formControl.disable();
      } else {
        this.formControl.enable();
      }
    }
  }

  protected disableForm(): void {
    this.formService.disableForm();
  }

  protected enableForm(): void {
    this.formService.enableForm();
  }

  setFormControl(formControl: FormControl): void {
    this.formControl = formControl;
  }
}
