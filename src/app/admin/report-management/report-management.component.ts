import { Component, OnInit } from '@angular/core';
import { TemplateService } from '@app/admin/template-management/template.service';
import {
  ViolationReport,
  ViolationReportDecision,
} from '@app/core/models/violation-report';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.component.html',
  styleUrl: '../admin-styles.scss',
})
export class ReportManagementComponent implements OnInit {
  isLoading = true;
  selectedTab = 0;
  reports: ViolationReport[] = [];

  panelOpenState = false;
  constructor(
    private violationReportService: ViolationReportService,
    private dialogService: DialogService,
    private translateService: TranslocoService,
    private templateService: TemplateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(hasDecision = false) {
    this.isLoading = true;
    this.violationReportService
      .getViolationReports(hasDecision)
      .subscribe((reports) => {
        this.reports = reports;
        this.isLoading = false;
      });
  }

  switchList(index: number): void {
    this.selectedTab = index;
    this.loadReports(index === 1);
  }

  getReasonString(reason: string): string {
    return this.violationReportService.getReasonString(reason);
  }

  getTargetType(targetType: string): string {
    return this.violationReportService.getTargetTypeString(targetType);
  }

  goToReportedContent(report: ViolationReport): void {
    let prefix = '';
    if (report.targetType === 'ContentGroupTemplate') {
      prefix = 'templates/';
    }
    if (prefix) {
      window.open(prefix + report.targetId, '_blank');
    }
  }

  openSubmitDialog(report: ViolationReport, shouldRemove: boolean) {
    const action = shouldRemove ? 'confirm' : 'dismiss';
    const dialogRef = this.dialogService.openDeleteDialog(
      'report',
      `admin.dialog.really-${action}-report`,
      shouldRemove
        ? this.translateService.translate(
            'admin.dialog.reported-content-will-be-deleted'
          )
        : undefined,
      'admin.admin-area.' + action,
      () => this.closeReport(report.id, shouldRemove)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.reports = this.reports.filter((r) => r.id !== report.id);
        const action = shouldRemove ? 'confirmed' : 'dismissed';
        const msg = this.translateService.translate(
          'admin.admin-area.report-has-been-' + action
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        if (shouldRemove && report.targetType === 'ContentGroupTemplate') {
          this.templateService.deleteTemplate(report.targetId).subscribe();
        }
      }
    });
  }

  closeReport(id: string, shouldRemove: boolean): Observable<ViolationReport> {
    const changes = {
      decision: shouldRemove
        ? ViolationReportDecision.REMOVAL
        : ViolationReportDecision.INVALID,
    };
    return this.violationReportService.patchViolationReport(id, changes);
  }
}
