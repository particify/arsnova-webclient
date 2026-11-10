import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { MemberSettings } from '@e2e/fixtures/creator/member-settings';
import {
  VERIFIED_ADMIN_STORAGE_STATE,
  VERIFIED_USER,
} from '@e2e/fixtures/shared/login';

// Access rights can only be assigned by a verified account, so this spec runs as the seeded admin
// whose session the auth setup project provides, rather than as the guest account the app creates
// implicitly. The grant target has to be the other account - a room owner cannot be granted a role
// in their own room.
const GRANT_TARGET = VERIFIED_USER;

test.describe('room team', () => {
  test.use({ storageState: VERIFIED_ADMIN_STORAGE_STATE });

  let memberSettings: MemberSettings;
  let roomSettings: RoomSettingsPage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    memberSettings = new MemberSettings(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('Room 1');
  });

  test.afterEach(async () => {
    await roomSettings.deleteRoomById(shortId);
  });

  test('add an existing account as moderator and see them in the share menu', async ({
    page,
  }) => {
    await memberSettings.open();
    await memberSettings.addMember(GRANT_TARGET.loginId);
    await expect(
      memberSettings.member(memberSettings.dialog, GRANT_TARGET.loginId)
    ).toContainText('Moderator');
    await page.keyboard.press('Escape');
    await expect(memberSettings.dialog).toBeHidden();

    await memberSettings.openTeamTab();
    const shown = memberSettings.member(
      memberSettings.menu,
      GRANT_TARGET.loginId
    );
    await expect(shown).toContainText('Moderator');
    await expect(shown.getByTestId('member-role-select')).toBeHidden();
    await expect(
      memberSettings.menu.getByTestId('member-settings-button')
    ).toBeVisible();
  });

  test('invite someone without an account by mail address', async () => {
    await memberSettings.open();
    test.skip(
      !(await memberSettings.loginIdIsEmail()),
      'Invitations need login IDs that are mail addresses.'
    );
    const invitee = `invitee-${Date.now()}@example.com`;

    await memberSettings.inviteByMail(invitee);

    const member = memberSettings.member(memberSettings.dialog, invitee);
    await expect(member).toContainText('Moderator');
    await expect(member).toContainText('unverified');
  });

  test('add editor', async () => {
    await memberSettings.open();
    await memberSettings.addMember(GRANT_TARGET.loginId, 'Editor');
    await expect(
      memberSettings.member(memberSettings.dialog, GRANT_TARGET.loginId)
    ).toContainText('Editor');
  });

  test('change the role of a member', async () => {
    await memberSettings.open();
    await memberSettings.addMember(GRANT_TARGET.loginId);

    await memberSettings.changeRole(GRANT_TARGET.loginId, 'Editor');
    await expect(
      memberSettings.member(memberSettings.dialog, GRANT_TARGET.loginId)
    ).toContainText('Editor');
  });

  test('remove members in the member settings', async ({ page }) => {
    await memberSettings.open();
    await memberSettings.addMember(GRANT_TARGET.loginId);
    const member = memberSettings.member(
      memberSettings.dialog,
      GRANT_TARGET.loginId
    );
    await expect(member).toBeVisible();

    await memberSettings.removeMember(GRANT_TARGET.loginId);
    await expect(member).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(memberSettings.dialog).toBeHidden();
  });
});
