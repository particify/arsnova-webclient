import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '@app/core/services/http/user.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockMatDialogRef,
  MockNotificationService,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { InputDialogComponent } from './input-dialog.component';
import { AdminService } from '@app/core/services/http/admin.service';

describe('InputDialogComponent', () => {
  let component: InputDialogComponent;
  let fixture: ComponentFixture<InputDialogComponent>;

  const dialogData = {
    inputName: 'input',
    primaryAction: 'action',
  };

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserByLoginId',
  ]);

  const mockAdminService = jasmine.createSpyObj(AdminService, ['getUser']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), InputDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
