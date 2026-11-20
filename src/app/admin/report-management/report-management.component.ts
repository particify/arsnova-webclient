import { Component, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NetworkStatus } from '@apollo/client';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  getViolationReportReasonKey,
  getViolationReportTargetTypeKey,
} from '@app/core/utils/violation-report';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  AdminDecideViolationReportGql,
  AdminViolationReportsByDecidedGql,
  ViolationReportDecision,
  ViolationReportDetailsFragment,
  ViolationReportTargetType,
} from '@gql/generated/graphql';

const REPORTED_CONTENT_ROUTES: Record<ViolationReportTargetType, string> = {
  [ViolationReportTargetType.Room]: '/admin/rooms',
  [ViolationReportTargetType.Template]: '/templates',
};

interface ReportItem {
  report: ViolationReportDetailsFragment;
  decisionKey?: string;
  deleteKey: string;
  link: string[];
  reasonKey: string;
  targetTypeKey: string;
  viewKey: string;
}

function toReportItem(report: ViolationReportDetailsFragment): ReportItem {
  const targetType = getViolationReportTargetTypeKey(report.targetType);
  return {
    report,
    decisionKey: report.decision
      ? 'admin.admin-area.' + report.decision.toLowerCase()
      : undefined,
    deleteKey: 'admin.admin-area.delete-' + targetType,
    link: [REPORTED_CONTENT_ROUTES[report.targetType], report.targetId],
    reasonKey:
      'violation-report.reason-' + getViolationReportReasonKey(report.reason),
    targetTypeKey: 'violation-report.' + targetType,
    viewKey: 'admin.admin-area.view-' + targetType,
  };
}

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.component.html',
  styleUrl: '../admin-styles.scss',
  imports: [
    FlexModule,
    AdminPageHeaderComponent,
    MatTabGroup,
    MatTab,
    LoadingIndicatorComponent,
    MatCard,
    MatButton,
    MatIcon,
    RouterLink,
    TranslocoPipe,
  ],
})
export class ReportManagementComponent {
  private adminViolationReports = inject(AdminViolationReportsByDecidedGql);
  private adminDecideViolationReport = inject(AdminDecideViolationReportGql);
  private dialogService = inject(DialogService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  readonly decided = signal(false);
  readonly noReportsKey = computed(
    () => 'admin.admin-area.no-reports-' + (this.decided() ? 'closed' : 'open')
  );

  /*
   * The cached list shows right away, while the network revalidates it: reports decided since
   * the closed list was last loaded only reach it that way.
   */
  private readonly reportsQueryRef = this.adminViolationReports.watch({
    variables: { decided: false },
    fetchPolicy: 'cache-and-network',
  });
  private readonly reportsResult = toSignal(this.reportsQueryRef.valueChanges);
  private readonly connection = computed(() => {
    const result = this.reportsResult();
    return result?.dataState === 'complete'
      ? result.data.adminViolationReportsByDecided
      : undefined;
  });
  readonly reports = computed(
    () => this.connection()?.edges?.flatMap((e) => (e ? [e.node] : [])) ?? []
  );
  readonly reportItems = computed(() => this.reports().map(toReportItem));
  readonly hasMore = computed(
    () => this.connection()?.pageInfo.hasNextPage ?? false
  );
  readonly isLoading = computed(() => {
    const result = this.reportsResult();
    return (
      !result ||
      ((result.networkStatus === NetworkStatus.loading ||
        result.networkStatus === NetworkStatus.setVariables) &&
        result.dataState !== 'complete')
    );
  });
  readonly isLoadingMore = computed(
    () => this.reportsResult()?.networkStatus === NetworkStatus.fetchMore
  );

  loadMore() {
    const cursor = this.connection()?.pageInfo.endCursor;
    if (cursor) {
      this.reportsQueryRef.fetchMore({ variables: { cursor } });
    }
  }

  switchList(decided: boolean): void {
    this.decided.set(decided);
    this.reportsQueryRef.setVariables({ decided });
  }

  openSubmitDialog(
    report: ViolationReportDetailsFragment,
    shouldRemove: boolean
  ) {
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
        const action = shouldRemove ? 'confirmed' : 'dismissed';
        const msg = this.translateService.translate(
          'admin.admin-area.report-has-been-' + action
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  /** A removal also deletes the reported target on the server. */
  closeReport(id: string, shouldRemove: boolean): Observable<object> {
    const decision = shouldRemove
      ? ViolationReportDecision.Removal
      : ViolationReportDecision.Invalid;
    return this.adminDecideViolationReport.mutate({
      variables: { id, decision },
      update: (cache, result) => {
        const cacheId = cache.identify({ __typename: 'ViolationReport', id });
        if (result.data?.adminDecideViolationReport && cacheId) {
          cache.evict({ id: cacheId });
          cache.gc();
        }
      },
    });
  }
}
