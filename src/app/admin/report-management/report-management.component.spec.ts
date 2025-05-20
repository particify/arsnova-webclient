import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportManagementComponent } from './report-management.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import { TemplateService } from '@app/admin/template-management/template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { MockNotificationService } from '@testing/test-helpers';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReportManagementComponent', () => {
  let component: ReportManagementComponent;
  let fixture: ComponentFixture<ReportManagementComponent>;

  const mockViolationReportService = jasmine.createSpyObj(
    ViolationReportService,
    ['getViolationReports', 'patchViolationReport']
  );
  mockViolationReportService.getViolationReports.and.returnValue(of([]));

  const mockDialogService = jasmine.createSpyObj(DialogService, [
    'openDeleteDialog',
  ]);

  const mockTemplateService = jasmine.createSpyObj(TemplateService, [
    'deleteTemplate',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), ReportManagementComponent],
      providers: [
        {
          provide: ViolationReportService,
          useValue: mockViolationReportService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
