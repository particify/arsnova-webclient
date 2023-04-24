import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessComponent } from './access.component';
import {
  JsonTranslationLoader,
  MockEventService,
  MockLangService,
} from '@arsnova/testing/test-helpers';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { Room } from '@arsnova/app/models/room';
import { ModeratorService } from '@arsnova/app/services/http/moderator.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { of } from 'rxjs';
import { Moderator } from '@arsnova/app/models/moderator';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { User } from '@arsnova/app/models/user';
import { Person } from '@arsnova/app/models/person';
import { AccessTokenService } from '@arsnova/app/services/http/access-token.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { AdvancedSnackBarTypes } from '@arsnova/app/services/util/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AccessComponent', () => {
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;

  const mockDialogService = jasmine.createSpyObj('DialogService', [
    'openDeleteDialog',
  ]);

  const mockModeratorService = jasmine.createSpyObj('ModeratorService', [
    'get',
    'add',
    'delete',
  ]);
  mockModeratorService.get.and.returnValue(
    of([new Moderator('1111', 'a@b.cd', UserRole.OWNER)])
  );
  mockModeratorService.add.and.returnValue(of({}));

  const mockUserService = jasmine.createSpyObj('UserService', [
    'getUserData',
    'getUserByLoginId',
  ]);
  mockUserService.getUserData.and.returnValue(
    of([new User('1111', 'a@b.cd', AuthProvider.ARSNOVA, '0', new Person())])
  );

  const mockAuthenticationService = jasmine.createSpyObj(
    'AuthenticationService',
    ['getCurrentAuthentication', 'isLoginIdEmailAddress']
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(
    of(
      new ClientAuthentication('1111', 'a@b.cd', AuthProvider.ARSNOVA, 'token')
    )
  );
  mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));

  const mockAccessTokenService = jasmine.createSpyObj('AccessTokenService', [
    'invite',
  ]);
  mockAccessTokenService.invite.and.returnValue(of({}));

  const mockNotificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);

  let loader: HarnessLoader;

  let addButton: MatButtonHarness;
  let inviteButton: MatButtonHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AccessComponent],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: ModeratorService,
          useValue: mockModeratorService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: AccessTokenService,
          useValue: mockAccessTokenService,
        },
      ],
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
  });

  it('should create', async () => {
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    expect(component).toBeTruthy();
  });

  it('should be able to load add button', async () => {
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    expect(addButton).not.toBeNull();
  });

  it('should add moderator to room if user was found with entered login id', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    mockUserService.getUserByLoginId.and.returnValue(
      of([new User('2222', 'b@b.cd', AuthProvider.ARSNOVA, '0', new Person())])
    );
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    fixture.detectChanges();
    await addButton.click();
    expect(mockModeratorService.add).toHaveBeenCalled();
  });

  it('should invite moderator to room if user was not found with entered login id', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    mockUserService.getUserByLoginId.and.returnValue(of([]));
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    inviteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#invite-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    fixture.detectChanges();
    await inviteButton.click();
    expect(mockAccessTokenService.invite).toHaveBeenCalled();
  });

  it('should invite moderator to room if user was not found with entered login id after another user was added', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    mockUserService.getUserByLoginId.and.returnValue(
      of([new User('2222', 'b@b.cd', AuthProvider.ARSNOVA, '0', new Person())])
    );
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    inviteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#invite-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    fixture.detectChanges();
    await inviteButton.click();
    expect(mockModeratorService.add).toHaveBeenCalled();
    component.newModeratorId = null;
    mockUserService.getUserByLoginId.and.returnValue(of([]));
    fixture.detectChanges();
    component.loginId = 'c@d.cd';
    fixture.detectChanges();
    component.getUser();
    await inviteButton.click();
    expect(mockAccessTokenService.invite).toHaveBeenCalled();
  });

  it('should show error notification if SSO is used and user was not found with entered login id after another user was added', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    mockUserService.getUserByLoginId.and.returnValue(
      of([new User('2222', 'b@b.cd', AuthProvider.ARSNOVA, '0', new Person())])
    );
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    fixture.detectChanges();
    await addButton.click();
    expect(mockModeratorService.add).toHaveBeenCalled();
    component.newModeratorId = null;
    mockUserService.getUserByLoginId.and.returnValue(of([]));
    fixture.detectChanges();
    component.loginId = 'c@d.cd';
    fixture.detectChanges();
    component.getUser();
    await addButton.click();
    expect(mockNotificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('should add moderator to room if SSO is used and user was found with entered username', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    mockUserService.getUserByLoginId.and.returnValue(
      of([
        new User('3333', 'username', AuthProvider.ARSNOVA, '0', new Person()),
      ])
    );
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'username';
    component.getUser();
    fixture.detectChanges();
    await addButton.click();
    expect(mockModeratorService.add).toHaveBeenCalled();
  });

  it('should show error notification if SSO is used and user was not found with entered username', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    mockUserService.getUserByLoginId.and.returnValue(of([]));
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    component.room = new Room(
      '1234',
      'shortId',
      'abbreviation',
      'name',
      'description'
    );
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'username';
    component.getUser();
    fixture.detectChanges();
    await addButton.click();
    expect(mockNotificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });
});
