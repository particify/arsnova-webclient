import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BarNotificationComponent } from './bar-notification.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@testing/test-helpers';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BarNotificationComponent', () => {
  let component: BarNotificationComponent;
  let fixture: ComponentFixture<BarNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BarNotificationComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
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
