import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AssignableRolesService } from '@app/standalone/room-members/assignable-roles';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import { RoomMemberFragment, RoomRole } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Subject, of } from 'rxjs';
import { MemberListComponent } from './member-list.component';

export function member(
  displayId: string,
  role: RoomRole,
  verified = true
): RoomMemberFragment {
  return {
    __typename: 'RoomMember',
    role,
    user: {
      __typename: 'User',
      id: 'id-' + displayId,
      displayId,
      displayName: null,
      verified,
    },
  };
}

describe('MemberListComponent', () => {
  let fixture: ComponentFixture<MemberListComponent>;
  let loader: HarnessLoader;
  let roomMembersService: jasmine.SpyObj<RoomMembersService>;
  let removal$: Subject<void>;

  const members = [
    member('owner@example.com', RoomRole.Owner),
    member('tutor@example.com', RoomRole.Moderator),
    member('colleague@example.com', RoomRole.Editor),
    member('guest@example.com', RoomRole.Moderator, false),
  ];

  function setUp(
    inputs: {
      limit?: number;
      members?: RoomMemberFragment[] | undefined;
      readonly?: boolean;
    } = {}
  ) {
    roomMembersService = jasmine.createSpyObj('RoomMembersService', [
      'changeRole',
      'remove',
    ]);
    removal$ = new Subject<void>();
    roomMembersService.remove.and.returnValue(removal$);
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getAuthenticatedUserChanges']
    );
    authenticationService.getAuthenticatedUserChanges.and.returnValue(
      of({ userId: 'id-owner@example.com' })
    );
    configureTestModule(
      [getTranslocoModule(), MemberListComponent],
      [
        provideNoopAnimations(),
        { provide: RoomMembersService, useValue: roomMembersService },
        { provide: AuthenticationService, useValue: authenticationService },
        {
          provide: AssignableRolesService,
          useValue: { getRoles: () => [RoomRole.Moderator, RoomRole.Editor] },
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(MemberListComponent);
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput(
      'members',
      'members' in inputs ? inputs.members : members
    );
    if (inputs.limit !== undefined) {
      fixture.componentRef.setInput('limit', inputs.limit);
    }
    if (inputs.readonly !== undefined) {
      fixture.componentRef.setInput('readonly', inputs.readonly);
    }
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }

  function names(): string[] {
    return [
      ...fixture.nativeElement.querySelectorAll(
        '[data-testid="team-member"] .name'
      ),
    ].map((n: HTMLElement) => n.textContent?.trim() ?? '');
  }

  async function roleSelects(): Promise<MatSelectHarness[]> {
    return loader.getAllHarnesses(MatSelectHarness);
  }

  async function roleSelect(index: number): Promise<MatSelectHarness> {
    return (await roleSelects())[index];
  }

  it('lists all members, the owner with a role that cannot be changed', async () => {
    setUp();

    expect(names().length).toBe(4);
    const selects = await roleSelects();
    expect(await Promise.all(selects.map((s) => s.isDisabled()))).toEqual([
      true,
      false,
      false,
      false,
    ]);
    expect(await selects[0].getValueText()).toBe('share.role-owner');
    expect(fixture.nativeElement.textContent).toContain('share.unverified');
  });

  it('marks the current user', () => {
    setUp();

    expect(names()[0]).toContain('share.you');
    expect(names()[1]).not.toContain('share.you');
  });

  it('shows only the first members when limited', () => {
    setUp({ limit: 3 });

    expect(names().length).toBe(3);
    expect(names()[2]).toBe('colleague@example.com');
  });

  it('only shows roles as text when read-only', async () => {
    setUp({ readonly: true });

    expect((await roleSelects()).length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('share.role-moderator');
  });

  it('is named by its label', () => {
    setUp();
    const label: HTMLElement =
      fixture.nativeElement.querySelector('.members-label');

    expect(label.textContent).toContain('share.members');
    expect(
      fixture.nativeElement.querySelector('ul').getAttribute('aria-labelledby')
    ).toBe(label.id);
  });

  it('shows the label while loading the members', () => {
    setUp({ members: undefined });

    expect(fixture.nativeElement.textContent).toContain('share.members');
    expect(
      fixture.nativeElement.querySelector('app-loading-indicator')
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('says so when there is no member', () => {
    setUp({ members: [] });

    expect(fixture.nativeElement.textContent).toContain('share.no-members');
  });

  it('offers the roles with descriptions and then removal', async () => {
    setUp();
    const select = await roleSelect(1);
    await select.open();

    const options = await select.getOptions();
    expect(await Promise.all(options.map((o) => o.getText()))).toEqual([
      jasmine.stringContaining('share.role-moderator-description'),
      jasmine.stringContaining('share.role-editor-description'),
      'share.remove',
    ]);
    expect(await (await options[2].host()).getAttribute('aria-label')).toBe(
      'share.a11y-remove-member'
    );
  });

  it('changes roles through the team service', async () => {
    setUp();
    const select = await roleSelect(1);
    await select.open();

    await select.clickOptions({ text: /share\.role-editor-description/ });

    expect(roomMembersService.changeRole).toHaveBeenCalledOnceWith(
      'room-1',
      members[1],
      RoomRole.Editor
    );
  });

  it('removes access without changing the role shown', async () => {
    setUp();
    const select = await roleSelect(1);
    await select.open();

    await select.clickOptions({ text: 'share.remove' });

    expect(roomMembersService.remove).toHaveBeenCalledOnceWith(
      'room-1',
      members[1]
    );
    expect(roomMembersService.changeRole).not.toHaveBeenCalled();
    expect(await select.getValueText()).toBe('share.role-moderator');
  });

  async function removeAndRender(
    index: number,
    remaining: RoomMemberFragment[]
  ) {
    const select = await roleSelect(index);
    await select.open();
    await select.clickOptions({ text: 'share.remove' });
    removal$.next();
    fixture.componentRef.setInput('members', remaining);
    fixture.detectChanges();
  }

  function focusedMemberId() {
    return document.activeElement
      ?.closest('[data-member-id]')
      ?.getAttribute('data-member-id');
  }

  it('moves the focus to the next member after a removal', async () => {
    setUp();

    await removeAndRender(1, [members[0], members[2], members[3]]);

    expect(focusedMemberId()).toBe('id-colleague@example.com');
  });

  it('moves the focus to the previous member after removing the last one', async () => {
    setUp();

    await removeAndRender(3, [members[0], members[1], members[2]]);

    expect(focusedMemberId()).toBe('id-colleague@example.com');
  });

  it('reports when no member is left to focus', async () => {
    setUp({ members: [members[0], members[1]] });
    const lastRemoved = jasmine.createSpy('lastRemoved');
    fixture.componentInstance.lastRemoved.subscribe(lastRemoved);

    await removeAndRender(1, [members[0]]);

    expect(lastRemoved).toHaveBeenCalled();
  });

  it('marks the initial of the owner apart from the others', () => {
    setUp();

    const avatars = [
      ...fixture.nativeElement.querySelectorAll('.avatar'),
    ] as HTMLElement[];
    expect(avatars.map((a) => a.classList.contains('primary-variant'))).toEqual(
      [true, false, false, false]
    );
  });
});
