import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishContentGroupTemplateComponent } from './publish-content-group-template.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockMatDialog,
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TemplateService } from '@app/creator/_services/template.service';

describe('PublishContentGroupTemplateComponent', () => {
  let component: PublishContentGroupTemplateComponent;
  let fixture: ComponentFixture<PublishContentGroupTemplateComponent>;

  const mockTemplateService = jasmine.createSpyObj('TemplateService', [
    'addContentGroupTemplate',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublishContentGroupTemplateComponent],
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(PublishContentGroupTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
