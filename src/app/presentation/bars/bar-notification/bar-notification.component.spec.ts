import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BarNotificationComponent } from './bar-notification.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BarNotificationComponent', () => {
  let component: BarNotificationComponent;
  let fixture: ComponentFixture<BarNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BarNotificationComponent],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
