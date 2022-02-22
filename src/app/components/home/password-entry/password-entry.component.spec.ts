import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordEntryComponent } from './password-entry.component';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { MockNotificationService, JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('PasswordEntryComponent', () => {
  let component: PasswordEntryComponent;
  let fixture: ComponentFixture<PasswordEntryComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordEntryComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService
        }
      ]      
    })
    .compileComponents();
    fixture = TestBed.createComponent(PasswordEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
