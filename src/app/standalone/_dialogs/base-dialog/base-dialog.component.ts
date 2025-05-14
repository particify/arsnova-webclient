import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@app/core/core.module';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { Observable, takeUntil } from 'rxjs';

interface DialogData {
  dialogId: string;
  headerLabel: string;
  body: string;
  confirmLabel: string;
  abortLabel?: string;
  type: string;
  additionalBody?: string;
  bodyElement?: string;
  link?: string;
  linkText?: string;
  confirmAction?: () => Observable<object>;
}

@Component({
  imports: [CoreModule, LoadingButtonComponent],
  selector: 'app-base-dialog',
  templateUrl: './base-dialog.component.html',
})
export class BaseDialogComponent extends FormComponent {
  dialogRef = inject<MatDialogRef<BaseDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  protected formService: FormService;

  readonly dialogId: string;

  constructor() {
    const formService = inject(FormService);

    super(formService);
    const data = this.data;
    this.formService = formService;

    this.dialogId = data.dialogId;
  }

  closeDialog(action: string): void {
    if (action === this.data.confirmLabel && this.data.confirmAction) {
      this.disableForm();
      this.data
        .confirmAction()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          () => {
            this.dialogRef.close(action);
          },
          () => {
            this.enableForm();
          }
        );
    } else {
      this.dialogRef.close(action);
    }
  }
}
