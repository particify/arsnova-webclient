import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockRouter,
  ActivatedRouteStub,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { of } from 'rxjs';
import { UserService } from '@app/core/services/http/user.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { User } from '@app/core/models/user';
import { Person } from '@app/core/models/person';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  const notificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);

  const mockDialogService = jasmine.createSpyObj(['openDeleteDialog']);

  const mockUserService = jasmine.createSpyObj([
    'getUserByLoginId',
    'delete',
    'updateUser',
  ]);
  const user = new User(
    '1',
    'a@b.cd',
    AuthProvider.ARSNOVA,
    'revision',
    new Person()
  );
  mockUserService.getUserByLoginId.and.returnValue(of([user]));

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
    'logout',
  ]);
  const auth = new ClientAuthentication(
    '1',
    'a@b.cd',
    AuthProvider.ARSNOVA,
    'token'
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

  let translateService: TranslateService;
  const a11yIntroPipe = new A11yIntroPipe(translateService);

  const snapshot = new ActivatedRouteSnapshot();

  snapshot.params = of([{ accountSettingsName: null }]);

  const activatedRouteStub = new ActivatedRouteStub(null, null, snapshot);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent, A11yIntroPipe],
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
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: A11yIntroPipe,
          useValue: a11yIntroPipe,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
