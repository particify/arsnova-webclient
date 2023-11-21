import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationReportComponent } from './violation-report.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ViolationReportComponent', () => {
  let component: ViolationReportComponent;
  let fixture: ComponentFixture<ViolationReportComponent>;

  const mockViolationReportService = jasmine.createSpyObj(
    ViolationReportService,
    ['postViolationReport', 'getTargetTypeString', 'getReasonString']
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ViolationReportComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            targetType: ContentGroupTemplate.name,
            targetId: 'targetId',
          },
        },
        {
          provide: ViolationReportService,
          useValue: mockViolationReportService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViolationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
