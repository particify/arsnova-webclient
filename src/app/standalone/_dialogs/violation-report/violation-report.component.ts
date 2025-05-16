import { Component, OnInit, inject } from '@angular/core';
import {
  ViolationReport,
  ViolationReportReason,
} from '@app/core/models/violation-report';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
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

@Component({
  selector: 'app-violation-report',
  imports: [CoreModule, LoadingButtonComponent],
  templateUrl: './violation-report.component.html',
})
export class ViolationReportComponent extends FormComponent implements OnInit {
  private dialogRef =
    inject<MatDialogRef<ViolationReportComponent>>(MatDialogRef);
  private data = inject<{
    targetType: string;
    targetId: string;
  }>(MAT_DIALOG_DATA);
  private violationReportService = inject(ViolationReportService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  reasons = Object.keys(ViolationReportReason);
  selectedReason?: ViolationReportReason;
  description = '';
  targetTypeString?: string;

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      reason: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
    this.targetTypeString = this.violationReportService.getTargetTypeString(
      this.data.targetType
    );
  }

  getReasonString(reason: string): string {
    return this.violationReportService.getReasonString(reason);
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
    const report = new ViolationReport(
      this.data.targetType,
      this.data.targetId,
      this.selectedReason,
      this.description
    );
    this.disableForm();
    this.violationReportService.postViolationReport(report).subscribe({
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
