import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormService } from '@app/core/services/util/form.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  template: '',
  standalone: false,
})
export abstract class FormComponent implements OnDestroy {
  protected destroyed$ = new Subject<void>();
  private formControl: FormControl = new FormControl();
  protected formGroup: FormGroup = new FormGroup([]);
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
    if (this.formDisabled) {
      this.formControl.disable();
      this.formGroup.disable();
    } else {
      this.formControl.enable();
      this.formGroup.enable();
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
