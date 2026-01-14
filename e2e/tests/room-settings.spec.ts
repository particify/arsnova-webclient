import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { RoomOverviewPage } from '@e2e/fixtures/participant/room-overview';

test.describe('room settings', () => {
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
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('update room name', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.updateName('My awesome room');
    await page.goBack();
    await expect(page.getByLabel('My awesome room')).toBeVisible();
  });

  test('add room description', async ({ baseURL }) => {
    await header.goToSettings();
    await roomSettings.updateDescription(
      'This is a short discription for this awesome room.'
    );
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const participant = new RoomOverviewPage(page, baseURL);
    await participant.goto(shortId);
    await expect(
      page.getByText('This is a short discription for this awesome room.')
    ).toBeVisible();
    await context.close();
  });

  test('set room language', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.setLanguage('English');
    await page.reload();
    await expect(page.getByText('English')).toBeVisible();
  });

  test('enable focus mode', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.toggleFocusMode();
    await page.reload();
    await expect(page.getByLabel('guide the participants')).toBeChecked();
  });
});
