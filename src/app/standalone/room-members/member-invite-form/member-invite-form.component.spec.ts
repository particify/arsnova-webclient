import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AssignableRolesService } from '@app/standalone/room-members/assignable-roles';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import {
  GrantRoomRoleByInvitationGql,
  GrantRoomRoleGql,
  RoomRole,
  UserByDisplayIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of, throwError } from 'rxjs';
import { MemberInviteFormComponent } from './member-invite-form.component';

describe('MemberInviteFormComponent', () => {
  let fixture: ComponentFixture<MemberInviteFormComponent>;
  let component: MemberInviteFormComponent;
  let loader: HarnessLoader;
  let userByDisplayId: jasmine.SpyObj<UserByDisplayIdGql>;
  let grant: jasmine.SpyObj<GrantRoomRoleGql>;
  let invite: jasmine.SpyObj<GrantRoomRoleByInvitationGql>;
  let roomMembersService: jasmine.SpyObj<RoomMembersService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(options: {
    loginIdIsEmail: boolean;
    verified?: boolean;
    roles?: RoomRole[];
  }) {
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication', 'isLoginIdEmailAddress']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of(new AuthenticatedUser('1111', options.verified ?? true, 'a@b.cd'))
    );
    authenticationService.isLoginIdEmailAddress.and.returnValue(
      of(options.loginIdIsEmail)
    );
    userByDisplayId = jasmine.createSpyObj('UserByDisplayIdGql', ['fetch']);
    grant = jasmine.createSpyObj('GrantRoomRoleGql', ['mutate']);
    grant.mutate.and.returnValue(of({ data: { grantRoomRole: {} } }) as never);
    invite = jasmine.createSpyObj('GrantRoomRoleByInvitationGql', ['mutate']);
    invite.mutate.and.returnValue(
      of({ data: { grantRoomRoleByInvitation: {} } }) as never
    );
    roomMembersService = jasmine.createSpyObj('RoomMembersService', [
      'refetchMembers',
    ]);
    roomMembersService.refetchMembers.and.returnValue(of({}) as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);
    configureTestModule(
      [getTranslocoModule(), MemberInviteFormComponent],
      [
        provideNoopAnimations(),
        { provide: AuthenticationService, useValue: authenticationService },
        {
          provide: AssignableRolesService,
          useValue: {
            getRoles: () => options.roles ?? [RoomRole.Moderator],
          },
        },
        { provide: UserByDisplayIdGql, useValue: userByDisplayId },
        { provide: GrantRoomRoleGql, useValue: grant },
        { provide: GrantRoomRoleByInvitationGql, useValue: invite },
        { provide: RoomMembersService, useValue: roomMembersService },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(MemberInviteFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }

  function field(): HTMLInputElement {
    return fixture.nativeElement.querySelector('[data-testid="team-login-id"]');
  }

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      '[data-testid="invite-submit-button"]'
    );
  }

  function type(value: string) {
    field().value = value;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function found(id = 'user-2') {
    return of({ data: { userByDisplayId: { id } } }) as never;
  }

  it('labels the field by what it takes, with no placeholder', () => {
    setUp({ loginIdIsEmail: true });

    expect(
      fixture.nativeElement.querySelector('.login-id mat-label')?.textContent
    ).toContain('share.email');
    expect(field().getAttribute('aria-label')).toBeNull();
    expect(field().placeholder).toBe('');
  });

  it('labels the field as a login ID where login IDs are no mail addresses', () => {
    setUp({ loginIdIsEmail: false });

    expect(
      fixture.nativeElement.querySelector('.login-id mat-label')?.textContent
    ).toContain('share.login-id');
  });

  it('labels the button by what the login IDs are', () => {
    setUp({ loginIdIsEmail: false });
    expect(button().textContent).toContain('share.add');
  });

  it('labels the button for invitations where login IDs are mail addresses', () => {
    setUp({ loginIdIsEmail: true });
    expect(button().textContent).toContain('share.invite');
  });

  it('disables the button until there is something valid to submit', () => {
    setUp({ loginIdIsEmail: true });
    expect(button().disabled).toBeTrue();

    type('   ');
    expect(button().disabled).toBeTrue();

    type('new@');
    expect(button().disabled).toBeTrue();

    type('new@example.com');
    expect(button().disabled).toBeFalse();
  });

  it('looks nothing up while typing', () => {
    setUp({ loginIdIsEmail: false });

    type('tutor');

    expect(userByDisplayId.fetch).not.toHaveBeenCalled();
  });

  it('adds an existing account by login ID', () => {
    setUp({ loginIdIsEmail: false });
    userByDisplayId.fetch.and.returnValue(found());
    type(' tutor ');

    button().click();

    expect(userByDisplayId.fetch).toHaveBeenCalledOnceWith({
      variables: { displayId: 'tutor' },
      fetchPolicy: 'network-only',
    });
    expect(grant.mutate).toHaveBeenCalledOnceWith({
      variables: {
        roomId: 'room-1',
        userId: 'user-2',
        role: RoomRole.Moderator,
      },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'share.user-added',
      jasmine.anything()
    );
    expect(roomMembersService.refetchMembers).toHaveBeenCalledWith('room-1');
    expect(component.usernameFormControl.value).toBe('');
  });

  it('submits on Enter', () => {
    setUp({ loginIdIsEmail: false });
    userByDisplayId.fetch.and.returnValue(found());
    type('tutor');

    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(grant.mutate).toHaveBeenCalledTimes(1);
  });

  it('reports an unknown login ID and keeps it for correction', () => {
    setUp({ loginIdIsEmail: false });
    userByDisplayId.fetch.and.returnValue(
      of({ data: { userByDisplayId: null } }) as never
    );
    type('nobody');

    button().click();
    fixture.detectChanges();

    expect(grant.mutate).not.toHaveBeenCalled();
    expect(invite.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'share.user-not-found',
      jasmine.anything()
    );
    expect(component.usernameFormControl.value).toBe('nobody');
    expect(button().disabled).toBeFalse();
  });

  it('reports a failed lookup of a login ID as not found', () => {
    setUp({ loginIdIsEmail: false });
    userByDisplayId.fetch.and.returnValue(throwError(() => new Error('404')));
    type('nobody');

    button().click();

    expect(invite.mutate).not.toHaveBeenCalled();
    expect(notificationService.showOnRequestClientError).toHaveBeenCalled();
  });

  it('adds an existing account by mail address', () => {
    setUp({ loginIdIsEmail: true });
    userByDisplayId.fetch.and.returnValue(found());
    type('known@example.com');

    button().click();

    expect(grant.mutate).toHaveBeenCalledTimes(1);
    expect(invite.mutate).not.toHaveBeenCalled();
  });

  it('invites a mail address without an account', () => {
    setUp({ loginIdIsEmail: true });
    userByDisplayId.fetch.and.returnValue(throwError(() => new Error('404')));
    type('new@example.com');

    button().click();

    expect(grant.mutate).not.toHaveBeenCalled();
    expect(invite.mutate).toHaveBeenCalledOnceWith({
      variables: {
        roomId: 'room-1',
        mailAddress: 'new@example.com',
        role: RoomRole.Moderator,
      },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'share.user-invited',
      jasmine.anything()
    );
    expect(component.usernameFormControl.value).toBe('');
  });

  it('disables the button while a submit is in flight', () => {
    setUp({ loginIdIsEmail: false });
    userByDisplayId.fetch.and.returnValue(NEVER as never);
    type('tutor');

    button().click();
    fixture.detectChanges();
    button().click();

    expect(button().disabled).toBeTrue();
    expect(userByDisplayId.fetch).toHaveBeenCalledTimes(1);
  });

  it('adds with the role chosen in the role select', async () => {
    setUp({
      loginIdIsEmail: false,
      roles: [RoomRole.Moderator, RoomRole.Editor],
    });
    userByDisplayId.fetch.and.returnValue(found());
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    expect(await Promise.all(options.map((o) => o.getText()))).toEqual([
      jasmine.stringContaining('share.role-moderator-description'),
      jasmine.stringContaining('share.role-editor-description'),
    ]);
    await options[1].click();
    type('colleague');

    button().click();

    expect(grant.mutate.calls.mostRecent().args[0]?.variables?.role).toBe(
      RoomRole.Editor
    );
  });

  it('puts the role in a labelled field of its own', () => {
    setUp({ loginIdIsEmail: false });

    expect(
      fixture.nativeElement.querySelector('.role mat-label')?.textContent
    ).toContain('share.role');
  });

  it('offers no role choice with a single role', async () => {
    setUp({ loginIdIsEmail: false });
    const select = await loader.getHarness(MatSelectHarness);

    expect(await select.isDisabled()).toBeTrue();
    expect(await select.getValueText()).toContain('share.role-moderator');
  });

  it('is disabled for guests', () => {
    setUp({ loginIdIsEmail: true, verified: false });

    expect(component.formDisabled).toBeTrue();
    expect(component.usernameFormControl.disabled).toBeTrue();
    expect(button().disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-hint')).not.toBeNull();
  });
});
