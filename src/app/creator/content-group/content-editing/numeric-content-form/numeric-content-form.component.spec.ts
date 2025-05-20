import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumericContentFormComponent } from './numeric-content-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockNotificationService } from '@testing/test-helpers';
describe('NumericContentFormComponent', () => {
  let component: NumericContentFormComponent;
  let fixture: ComponentFixture<NumericContentFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      imports: [getTranslocoModule(), NumericContentFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NumericContentFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
