import { test, expect, Page } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import {
  VERIFIED_ADMIN_STORAGE_STATE,
  VERIFIED_USER,
} from '@e2e/fixtures/shared/login';

// Access rights can only be assigned by a verified account, so this spec runs as the seeded admin
// whose session the auth setup project provides, rather than as the guest account the app creates
// implicitly. The grant target has to be the other account - a room owner cannot be granted a role
// in their own room.
const GRANT_TARGET = VERIFIED_USER;

test.describe('room access settings', () => {
  test.use({ storageState: VERIFIED_ADMIN_STORAGE_STATE });

  let header: Header;
  let roomSettings: RoomSettingsPage;
  let homePage: HomePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('Room 1');
    await header.goToSettings('Access rights');
  });

  test.afterEach(async () => {
    await roomSettings.deleteRoomById(shortId);
  });

  test('go to access settings', async ({ page }) => {
    await page.waitForURL(/\/settings\/access/);
  });

  test('add moderator', async ({ page }) => {
    await addModerator(page);
    await expect(page.getByText(GRANT_TARGET.loginId).first()).toBeVisible();
    await expect(
      page.getByText('Moderator', { exact: true }).first()
    ).toBeVisible();
  });

  test('add editor', async ({ page }) => {
    await addModerator(page, 'editor');
    await expect(page.getByText(GRANT_TARGET.loginId).first()).toBeVisible();
    await expect(
      page.getByText('Editor', { exact: true }).first()
    ).toBeVisible();
  });

  test('remove moderator', async ({ page }) => {
    await addModerator(page);
    await expect(page.getByText(GRANT_TARGET.loginId).first()).toBeVisible();
    await expect(
      page.getByText('Moderator', { exact: true }).first()
    ).toBeVisible();
    await page.getByTestId('remove-access-rights-btn').click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(page.getByText(GRANT_TARGET.loginId).first()).toBeHidden();
  });
});

async function addModerator(page: Page, role?: string) {
  await page.getByLabel('User', { exact: true }).fill(GRANT_TARGET.loginId);
  if (role) {
    await page.getByLabel('Role', { exact: true }).click();
    await page.getByRole('option', { name: role }).click();
  }
  await page.getByRole('button', { name: 'add user' }).click();
  await page.waitForResponse(
    (res) => !!res.request().postData()?.includes('UserByDisplayId') && res.ok()
  );
}
