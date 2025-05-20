import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserActivationComponent } from './user-activation.component';

import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  MockMatDialogRef,
  ActivatedRouteStub,
  MockEventService,
} from '@testing/test-helpers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { UserService } from '@app/core/services/http/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserActivationComponent', () => {
  let component: UserActivationComponent;
  let fixture: ComponentFixture<UserActivationComponent>;

  const activatedRouteStub = new ActivatedRouteStub();

  const dialogData = {
    activationKey: '1234',
  };

  const mockUserService = jasmine.createSpyObj(['activate', 'resetActivation']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), UserActivationComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
