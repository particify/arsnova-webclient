import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import { Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockRouter
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { of } from 'rxjs';
import { UserService } from '@arsnova/app/services/http/user.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { User } from '@arsnova/app/models/user';
import { Person } from '@arsnova/app/models/person';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let notificationService = jasmine.createSpyObj('NotificationService', ['showAdvanced']);

  const mockDialogService = jasmine.createSpyObj(['openDeleteDialog']);

  const mockUserService = jasmine.createSpyObj(['getUserByLoginId', 'delete', 'updateUser']);
  const user = new User('1', 'a@b.cd', AuthProvider.ARSNOVA, 'revision', new Person());
  mockUserService.getUserByLoginId.and.returnValue(of([user]));

  const mockAuthenticationService = jasmine.createSpyObj(['getCurrentAuthentication', 'logout']);
  const auth = new ClientAuthentication('1', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

  let translateService: TranslateService;
  const a11yIntroPipe = new A11yIntroPipe(translateService);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UserProfileComponent,
        A11yIntroPipe
      ],
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
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: NotificationService,
          useValue: notificationService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: DialogService,
          useValue: mockDialogService
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
