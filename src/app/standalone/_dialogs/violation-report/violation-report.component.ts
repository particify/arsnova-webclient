import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
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

@Component({
  selector: 'app-violation-report',
  imports: [CoreModule, LoadingButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './violation-report.component.html',
})
export class ViolationReportComponent extends FormComponent implements OnInit {
  private dialogRef =
    inject<MatDialogRef<ViolationReportComponent>>(MatDialogRef);
  private data = inject<{
    targetType: ViolationReportTargetType;
    targetId: string;
  }>(MAT_DIALOG_DATA);
  private createViolationReport = inject(CreateViolationReportGql);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  reasons = Object.values(ViolationReportReason);
  selectedReason?: ViolationReportReason;
  description = '';
  targetTypeString?: string;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      reason: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
    this.targetTypeString = getViolationReportTargetTypeKey(
      this.data.targetType
    );
  }

  getReasonString(reason: ViolationReportReason): string {
    return getViolationReportReasonKey(reason);
  }

  sendReport(): void {
    if (!this.data.targetType || !this.data.targetId) {
      return;
    }
    if (this.formGroup.invalid || !this.selectedReason) {
      for (const control in this.formGroup.controls) {
        if (this.formGroup.get(control)?.invalid) {
          const msg = this.translateService.translate(
            'violation-report.please-enter-' + control
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
          return;
        }
      }
      return;
    }
    const input = {
      targetType: this.data.targetType,
      targetId: this.data.targetId,
      reason: this.selectedReason,
      description: this.description,
    };
    this.disableForm();
    this.createViolationReport.mutate({ variables: { input } }).subscribe({
      next: () => {
        const msg = this.translateService.translate(
          'violation-report.reported-' + this.targetTypeString
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
}
