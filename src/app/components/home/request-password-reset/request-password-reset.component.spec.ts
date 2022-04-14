import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestPasswordResetComponent } from './request-password-reset.component';
import { Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  MockEventService,
  MockNotificationService,
  MockRouter,
  JsonTranslationLoader
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { UserService } from '@arsnova/app/services/http/user.service';

describe('RequestPasswordResetComponent', () => {
  let component: RequestPasswordResetComponent;
  let fixture: ComponentFixture<RequestPasswordResetComponent>;

  const mockUserService = jasmine.createSpyObj(['setNewPassword']);

  window.history.pushState({data: 'a@b.cd'}, '', '');

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [ RequestPasswordResetComponent ],
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
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(RequestPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
