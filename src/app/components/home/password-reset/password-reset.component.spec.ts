import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetComponent } from './password-reset.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import {
  ActivatedRouteStub,
  MockEventService,
  MockNotificationService,
  MockRouter,
  JsonTranslationLoader
} from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { UserService } from '@arsnova/app/services/http/user.service';
import { of } from 'rxjs';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;

  const mockUserService = jasmine.createSpyObj(['setNewPassword']);

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{email: 'a@b.cd'}]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordResetComponent ],
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
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
