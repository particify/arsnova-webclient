import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from '@app/standalone/form/form.component';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { CoreModule } from '@app/core/core.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CreateViolationReportGql,
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';
import {
  getViolationReportReasonKey,
  getViolationReportTargetTypeKey,
} from '@app/core/utils/violation-report';
import { map } from 'rxjs';

const DESCRIPTION_MAX_LENGTH = 500;

@Component({
  selector: 'app-violation-report',
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './violation-report.component.html',
})
export class ViolationReportComponent extends FormComponent {
  private dialogRef =
    inject<MatDialogRef<ViolationReportComponent>>(MatDialogRef);
  private data = inject<{
    targetType: ViolationReportTargetType;
    targetId: string;
  }>(MAT_DIALOG_DATA);
  private createViolationReport = inject(CreateViolationReportGql);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  protected override formGroup = new FormGroup({
    reason: new FormControl<ViolationReportReason | null>(
      null,
      Validators.required
    ),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(DESCRIPTION_MAX_LENGTH),
      ],
    }),
  });

  readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  readonly descriptionLength = toSignal(
    this.formGroup.controls.description.valueChanges.pipe(
      map((description) => description.length)
    ),
    { initialValue: 0 }
  );
  readonly reasons = Object.values(ViolationReportReason).map((reason) => ({
    reason,
    labelKey: 'violation-report.reason-' + getViolationReportReasonKey(reason),
  }));
  private readonly targetType = getViolationReportTargetTypeKey(
    this.data.targetType
  );
  readonly titleKey = 'violation-report.report-' + this.targetType;

  sendReport(): void {
    if (!this.data.targetType || !this.data.targetId) {
      return;
    }
    const { reason, description } = this.formGroup.getRawValue();
    if (this.formGroup.invalid || !reason) {
      this.warnAboutInvalidControl();
      return;
    }
    const input = {
      targetType: this.data.targetType,
      targetId: this.data.targetId,
      reason,
      description,
    };
    this.disableForm();
    this.createViolationReport.mutate({ variables: { input } }).subscribe({
      next: () => {
        const msg = this.translateService.translate(
          'violation-report.reported-' + this.targetType
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.dialogRef.close();
      },
      error: () => this.enableForm(),
    });
  }

  private warnAboutInvalidControl(): void {
    const control = Object.entries(this.formGroup.controls).find(
      ([, control]) => control.invalid
    )?.[0];
    if (control) {
      const msg = this.translateService.translate(
        'violation-report.please-enter-' + control
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }
}
