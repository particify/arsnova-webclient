import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViolationReport } from '@app/core/models/violation-report';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { AdminDeleteTemplateGql } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { ReportManagementComponent } from './report-management.component';

describe('ReportManagementComponent', () => {
  let fixture: ComponentFixture<ReportManagementComponent>;
  let component: ReportManagementComponent;
  let deleteTemplateGql: jasmine.SpyObj<AdminDeleteTemplateGql>;
  let dialogService: jasmine.SpyObj<DialogService>;

  const report = {
    id: 'report-1',
    targetId: 't-1',
    targetType: 'ContentGroupTemplate',
  } as ViolationReport;

  beforeEach(() => {
    deleteTemplateGql = jasmine.createSpyObj('AdminDeleteTemplateGql', [
      'mutate',
    ]);
    deleteTemplateGql.mutate.and.returnValue(of({ data: {} }) as never);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    const violationReportService = jasmine.createSpyObj(
      'ViolationReportService',
      ['getViolationReports']
    );
    violationReportService.getViolationReports.and.returnValue(of([report]));
    TestBed.overrideComponent(ReportManagementComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ReportManagementComponent],
      [
        { provide: AdminDeleteTemplateGql, useValue: deleteTemplateGql },
        { provide: DialogService, useValue: dialogService },
        { provide: ViolationReportService, useValue: violationReportService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deletes a reported template once the report is confirmed', () => {
    component.openSubmitDialog(report, true);
    expect(deleteTemplateGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 't-1' },
    });
    expect(component.reports).toEqual([]);
  });

  it('keeps a reported template when the report is dismissed', () => {
    component.openSubmitDialog(report, false);
    expect(deleteTemplateGql.mutate).not.toHaveBeenCalled();
  });
});
