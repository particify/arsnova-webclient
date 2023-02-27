import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '@arsnova/app/services/http/user.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  JsonTranslationLoader,
  MockMatDialogRef,
  MockNotificationService,
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { InputDialogComponent } from './input-dialog.component';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputDialogComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
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
