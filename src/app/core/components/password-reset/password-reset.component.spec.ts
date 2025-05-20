import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetComponent } from './password-reset.component';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockEventService,
  MockNotificationService,
  MockRouter,
} from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { UserService } from '@app/core/services/http/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;

  const mockUserService = jasmine.createSpyObj(['setNewPassword']);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), PasswordResetComponent],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
