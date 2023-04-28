import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordEntryComponent } from './password-entry.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  MockNotificationService,
  JsonTranslationLoader,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PasswordEntryComponent', () => {
  let component: PasswordEntryComponent;
  let fixture: ComponentFixture<PasswordEntryComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [PasswordEntryComponent],
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
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PasswordEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
