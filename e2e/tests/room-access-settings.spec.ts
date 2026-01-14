import { test, expect, Page } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('room access settings', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('Room 1');
    await header.goToSettings('Access rights');
  });

  test.afterEach(async () => {
    await header.goToSettings('Room');
    await roomSettings.deleteRoom();
  });

  test('go to access settings', async ({ page }) => {
    await page.waitForURL(/\/settings\/access/);
  });

  test('add moderator', async ({ page }) => {
    await addModerator(page);
    await expect(page.getByText('user@example.com').first()).toBeVisible();
    await expect(
      page.getByText('Moderator', { exact: true }).first()
    ).toBeVisible();
  });

  test('add editor', async ({ page }) => {
    await addModerator(page, 'editor');
    await expect(page.getByText('user@example.com').first()).toBeVisible();
    await expect(
      page.getByText('Editor', { exact: true }).first()
    ).toBeVisible();
  });

  test('remove moderator', async ({ page }) => {
    await addModerator(page);
    await expect(page.getByText('user@example.com').first()).toBeVisible();
    await expect(
      page.getByText('Moderator', { exact: true }).first()
    ).toBeVisible();
    await page.getByTestId('remove-access-rights-btn').click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(page.getByText('user@example.com').first()).toBeHidden();
  });
});

async function addModerator(page: Page, role?: string) {
  await page.getByLabel('User', { exact: true }).fill('user@example.com');
  if (role) {
    await page.getByLabel('Role', { exact: true }).click();
    await page.getByRole('option', { name: role }).click();
  }
  await page.getByRole('button', { name: 'add user' }).click();
  await page.waitForResponse(
    (res) => !!res.request().postData()?.includes('UserByDisplayId') && res.ok()
  );
}
