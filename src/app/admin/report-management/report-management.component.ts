import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
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
import {
  AdminDecideViolationReportGql,
  AdminViolationReportsByDecidedGql,
  ViolationReportDecision,
  ViolationReportDetailsFragment,
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-report-management',
  templateUrl: './report-management.component.html',
  styleUrl: '../admin-styles.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FlexModule,
    AdminPageHeaderComponent,
    MatTabGroup,
    MatTab,
    LoadingIndicatorComponent,
    MatCard,
    MatButton,
    MatIcon,
    TranslocoPipe,
  ],
})
export class ReportManagementComponent {
  private adminViolationReports = inject(AdminViolationReportsByDecidedGql);
  private adminDecideViolationReport = inject(AdminDecideViolationReportGql);
  private dialogService = inject(DialogService);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  selectedTab = 0;

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

  switchList(index: number): void {
    this.selectedTab = index;
    this.reportsQueryRef.setVariables({ decided: index === 1 });
  }

  getReasonString(reason: ViolationReportReason): string {
    return getViolationReportReasonKey(reason);
  }

  getTargetType(targetType: ViolationReportTargetType): string {
    return getViolationReportTargetTypeKey(targetType);
  }

  goToReportedContent(report: ViolationReportDetailsFragment): void {
    switch (report.targetType) {
      case ViolationReportTargetType.Room:
        window.open('admin/rooms/' + report.targetId, '_blank');
        break;
      case ViolationReportTargetType.Template:
        window.open('templates/' + report.targetId, '_blank');
        break;
    }
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
