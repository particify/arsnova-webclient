import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DialogService } from '@app/core/services/util/dialog.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { MemberSettingsDialogComponent } from '@app/standalone/room-members/member-settings-dialog/member-settings-dialog.component';
import { member } from '@app/standalone/room-members/member-list/member-list.component.spec';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import { RoomRole } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of } from 'rxjs';
import { ShareRoomComponent } from './share-room.component';

describe('ShareRoomComponent', () => {
  let fixture: ComponentFixture<ShareRoomComponent>;
  let loader: HarnessLoader;
  let dialogService: jasmine.SpyObj<DialogService>;
  let roomMembersService: jasmine.SpyObj<RoomMembersService>;

  const members = [
    member('owner@example.com', RoomRole.Owner),
    member('a@example.com', RoomRole.Moderator),
    member('b@example.com', RoomRole.Moderator),
    member('c@example.com', RoomRole.Moderator),
    member('d@example.com', RoomRole.Editor),
  ];

  function setUp(isOwner: boolean, team = members) {
    dialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
    roomMembersService = jasmine.createSpyObj('RoomMembersService', [
      'watchMembers',
    ]);
    roomMembersService.watchMembers.and.returnValue(of(team));
    configureTestModule(
      [getTranslocoModule(), ShareRoomComponent],
      [
        provideNoopAnimations(),
        { provide: DialogService, useValue: dialogService },
        { provide: RoomMembersService, useValue: roomMembersService },
        {
          provide: RoutingService,
          useValue: { getRoomJoinUrl: () => 'https://example.com/p/1234' },
        },
        { provide: LocalFileService, useValue: {} },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ShareRoomComponent);
    fixture.componentRef.setInput('roomName', 'Room');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('isOwner', isOwner);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  }

  async function openMenu() {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    return menu;
  }

  it('shows only the participants content to other roles', async () => {
    setUp(false);
    await openMenu();

    expect(await loader.getHarnessOrNull(MatTabGroupHarness)).toBeNull();
    expect(document.body.textContent).toContain(
      'share.share-room-with-participants'
    );
    expect(roomMembersService.watchMembers).not.toHaveBeenCalled();
  });

  it('offers the owner a team tab with the first members', async () => {
    setUp(true);
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    expect(
      await Promise.all((await tabs.getTabs()).map((t) => t.getLabel()))
    ).toEqual(['share.participants', 'share.team']);

    await tabs.selectTab({ label: 'share.team' });

    expect(roomMembersService.watchMembers).toHaveBeenCalledOnceWith('room-1');
    expect(
      document.querySelectorAll('[data-testid="team-member"]').length
    ).toBe(3);
    expect(
      document.querySelector('[data-testid="member-role-select"]')
    ).toBeNull();
    expect(document.querySelector('app-member-invite-form')).toBeNull();
    expect(
      document.querySelector('[data-testid="team-more-members"]')?.textContent
    ).toContain('share.more-members');
    expect(
      document
        .querySelector('[data-testid="member-settings-button"]')
        ?.classList.contains('member-settings')
    ).toBeTrue();
  });

  it('invites the owner without a team to build one', async () => {
    setUp(true, [members[0]]);
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });

    expect(document.body.textContent).toContain('share.members-empty-hint');
    expect(document.querySelector('[data-testid="team-member"]')).toBeNull();
    expect(document.querySelector('app-member-list')).toBeNull();
    expect(
      document.querySelector('[data-testid="team-empty-state"]')?.textContent
    ).toContain('share.invite-members');
    expect(
      document.querySelector('[data-testid="member-settings-button"]')
        ?.textContent
    ).toContain('share.manage-members');
  });

  it('opens on the participants tab again after closing', async () => {
    setUp(true, [members[0]]);
    const menu = await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });
    await menu.close();
    await menu.open();

    const reopened = await loader.getHarness(MatTabGroupHarness);
    const selected = await reopened.getSelectedTab();
    expect(await selected.getLabel()).toBe('share.participants');
  });

  it('shows the member list while loading the members', async () => {
    setUp(true);
    roomMembersService.watchMembers.and.returnValue(NEVER);
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });

    expect(document.querySelector('app-member-list')).not.toBeNull();
    expect(
      document.querySelector('[data-testid="member-settings-button"]')
    ).toBeNull();
  });

  it('mentions further members only as text', async () => {
    setUp(true);
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });

    const more = document.querySelector('[data-testid="team-more-members"]');
    expect(more?.tagName).toBe('P');
    expect(more?.closest('button, a')).toBeNull();
    expect(
      document.querySelectorAll('.team button:not(.mat-mdc-tab)').length
    ).toBe(1);
  });

  it('mentions no further members while the preview lists them all', async () => {
    setUp(true, members.slice(0, 3));
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });

    expect(
      document.querySelectorAll('[data-testid="team-member"]').length
    ).toBe(3);
    expect(
      document.querySelector('[data-testid="team-more-members"]')
    ).toBeNull();
  });

  it('opens the member settings for the rest', async () => {
    setUp(true);
    await openMenu();
    const tabs = await loader.getHarness(MatTabGroupHarness);
    await tabs.selectTab({ label: 'share.team' });

    (
      document.querySelector(
        '[data-testid="member-settings-button"]'
      ) as HTMLElement
    ).click();

    expect(dialogService.openDialog).toHaveBeenCalledOnceWith(
      MemberSettingsDialogComponent,
      jasmine.objectContaining({ data: { roomId: 'room-1' } })
    );
  });

  it('stays open while typing and tabbing inside', () => {
    setUp(true);
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'stopPropagation');

    fixture.componentInstance.keepMenuOpen(event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
