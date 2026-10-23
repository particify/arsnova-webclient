import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessComponent } from './access.component';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { of } from 'rxjs';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestModule } from '@testing/test.setup';
import {
  GrantRoomRoleByInvitationDocument,
  GrantRoomRoleByInvitationGql,
  GrantRoomRoleByInvitationMutation,
  GrantRoomRoleDocument,
  GrantRoomRoleGql,
  GrantRoomRoleMutation,
  RoomManagingMembersByRoomIdGql,
  RoomRole,
  UserByDisplayIdDocument,
  UserByDisplayIdGql,
  UserByDisplayIdQuery,
} from '@gql/generated/graphql';

xdescribe('AccessComponent', () => {
  let testBed: TestBed;
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;

  const mockDialogService = jasmine.createSpyObj('DialogService', [
    'openDeleteDialog',
  ]);

  const mockAuthenticationService = jasmine.createSpyObj(
    'AuthenticationService',
    ['getCurrentAuthentication', 'isLoginIdEmailAddress']
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(
    of(new AuthenticatedUser('1111', true, 'a@b.cd'))
  );
  mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));

  const mockNotificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);

  let loader: HarnessLoader;
  let controller: ApolloTestingController;

  let addButton: MatButtonHarness;
  let inviteButton: MatButtonHarness;

  beforeEach(waitForAsync(() => {
    testBed = configureTestModule(
      [getTranslocoModule(), ApolloTestingModule, AccessComponent],
      [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ]
    );
    controller = TestBed.inject(ApolloTestingController);
    testBed.compileComponents();
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    controller.verify();
  });

  it('should create', async () => {
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    expect(component).toBeTruthy();
  });

  it('should be able to load add button', async () => {
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    expect(addButton).not.toBeNull();
  });

  it('should add moderator to room if user was found with entered login id', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    const op1 = controller.expectOne(UserByDisplayIdDocument);
    op1.flushData({
      userByDisplayId: {
        __typename: 'User',
        id: '2222',
        displayId: 'b@b.cd',
        displayName: null,
        verified: true,
      },
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await addButton.click();
    const op2 = controller.expectOne(GrantRoomRoleDocument);
    op2.flushData({
      grantRoomRole: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleMutation);
  });

  it('should invite moderator to room if user was not found with entered login id', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    inviteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#invite-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    const op1 = controller.expectOne(UserByDisplayIdDocument);
    op1.flushData({
      userByDisplayId: null,
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await inviteButton.click();
    const op2 = controller.expectOne(GrantRoomRoleByInvitationDocument);
    op2.flushData({
      grantRoomRoleByInvitation: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleByInvitationMutation);
  });

  it('should invite moderator to room if user was not found with entered login id after another user was added', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(true));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    inviteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#invite-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    const op1 = controller.expectOne(UserByDisplayIdDocument);
    op1.flushData({
      userByDisplayId: {
        __typename: 'User',
        id: '2222',
        displayId: 'b@b.cd',
        displayName: null,
        verified: true,
      },
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await inviteButton.click();
    const op2 = controller.expectOne(GrantRoomRoleByInvitationDocument);
    op2.flushData({
      grantRoomRoleByInvitation: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleByInvitationMutation);
    component.newMemberId = '';
    fixture.detectChanges();
    component.loginId = 'c@d.cd';
    fixture.detectChanges();
    component.getUser();
    const op3 = controller.expectOne(UserByDisplayIdDocument);
    op3.flushData({
      userByDisplayId: null,
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await inviteButton.click();
    const op4 = controller.expectOne(GrantRoomRoleByInvitationDocument);
    op4.flushData({
      grantRoomRoleByInvitation: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleByInvitationMutation);
  });

  it('should show error notification if SSO is used and user was not found with entered login id after another user was added', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'b@a.cd';
    component.getUser();
    const op1 = controller.expectOne(UserByDisplayIdDocument);
    op1.flushData({
      userByDisplayId: {
        __typename: 'User',
        id: '2222',
        displayId: 'b@a.cd',
        displayName: null,
        verified: true,
      },
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await addButton.click();
    const op2 = controller.expectOne(GrantRoomRoleDocument);
    op2.flushData({
      grantRoomRole: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleMutation);
    component.newMemberId = '';
    fixture.detectChanges();
    component.loginId = 'c@d.cd';
    fixture.detectChanges();
    component.getUser();
    const op3 = controller.expectOne(UserByDisplayIdDocument);
    op3.flushData({
      userByDisplayId: null,
    } satisfies UserByDisplayIdQuery);
    await addButton.click();
    expect(mockNotificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('should add moderator to room if SSO is used and user was found with entered username', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'username';
    component.getUser();
    const op1 = controller.expectOne(UserByDisplayIdDocument);
    op1.flushData({
      userByDisplayId: {
        __typename: 'User',
        id: '2222',
        displayId: 'b@a.cd',
        displayName: null,
        verified: true,
      },
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await addButton.click();
    const op2 = controller.expectOne(GrantRoomRoleDocument);
    op2.flushData({
      grantRoomRole: {
        __typename: 'RoomMember',
        role: RoomRole.Moderator,
        room: { __typename: 'Room', id: '1234' },
        user: { __typename: 'User', id: '2222' },
      },
    } satisfies GrantRoomRoleMutation);
  });

  it('should show error notification if SSO is used and user was not found with entered username', async () => {
    mockAuthenticationService.isLoginIdEmailAddress.and.returnValue(of(false));
    fixture = testBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#add-button' })
    );
    component.loginId = 'username';
    component.getUser();
    const op = controller.expectOne(UserByDisplayIdDocument);
    op.flushData({
      userByDisplayId: null,
    } satisfies UserByDisplayIdQuery);
    fixture.detectChanges();
    await addButton.click();
    expect(mockNotificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });
});

describe('AccessComponent mail address validation', () => {
  let fixture: ComponentFixture<AccessComponent>;
  let loader: HarnessLoader;
  let grantRoomRole: jasmine.Spy;
  let grantRoomRoleByInvitation: jasmine.Spy;

  async function createComponent(loginIdIsEmail: boolean) {
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication', 'isLoginIdEmailAddress']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of(new AuthenticatedUser('1111', true, 'a@b.cd'))
    );
    authenticationService.isLoginIdEmailAddress.and.returnValue(
      of(loginIdIsEmail)
    );
    grantRoomRole = jasmine
      .createSpy('mutate')
      .and.returnValue(of({ data: {} }));
    grantRoomRoleByInvitation = jasmine
      .createSpy('mutate')
      .and.returnValue(of({ data: {} }));
    const userByDisplayId = jasmine.createSpyObj('UserByDisplayIdGql', [
      'fetch',
    ]);
    userByDisplayId.fetch.and.returnValue(
      of({
        data: {
          userByDisplayId: loginIdIsEmail
            ? null
            : { id: '2222', displayId: 'username', verified: true },
        },
      })
    );

    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), AccessComponent],
      [
        { provide: AuthenticationService, useValue: authenticationService },
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj('DialogService', ['openDeleteDialog']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        { provide: GrantRoomRoleGql, useValue: { mutate: grantRoomRole } },
        {
          provide: GrantRoomRoleByInvitationGql,
          useValue: { mutate: grantRoomRoleByInvitation },
        },
        {
          provide: RoomManagingMembersByRoomIdGql,
          useValue: {
            watch: () => ({
              valueChanges: of({
                loading: false,
                dataState: 'complete',
                data: { roomManagingMembersByRoomId: [] },
              }),
              refetch: () => undefined,
            }),
          },
        },
        { provide: UserByDisplayIdGql, useValue: userByDisplayId },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(AccessComponent);
    fixture.componentRef.setInput('roomId', '1234');
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  }

  async function enterAndSubmit(loginId: string) {
    await (await loader.getHarness(MatInputHarness)).setValue(loginId);
    // Completes the lookup the input triggers after a debounce.
    fixture.componentInstance.getUser();
    fixture.detectChanges();
    const button = loader.getHarness(
      MatButtonHarness.with({ selector: ':not([hidden]).add-user-button' })
    );
    await (await button).click();
  }

  it('should not invite an invalid mail address', async () => {
    await createComponent(true);
    await enterAndSubmit('mail@example.com>');

    expect(grantRoomRoleByInvitation).not.toHaveBeenCalled();
    const field = await loader.getHarness(MatFormFieldHarness);
    expect(await field.getTextErrors()).toEqual(['login.email-invalid']);
  });

  it('should invite a valid mail address', async () => {
    await createComponent(true);
    await enterAndSubmit('mail@example.com');

    expect(grantRoomRoleByInvitation).toHaveBeenCalledWith(
      jasmine.objectContaining({
        variables: jasmine.objectContaining({
          mailAddress: 'mail@example.com',
        }),
      })
    );
  });

  it('should not validate a username as a mail address', async () => {
    await createComponent(false);
    await enterAndSubmit('username');

    expect(grantRoomRole).toHaveBeenCalled();
    const field = await loader.getHarness(MatFormFieldHarness);
    expect(await field.getTextErrors()).toEqual([]);
  });
});
