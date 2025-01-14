import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('create room', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('create two question series', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('Survey', 'Survey');
    await page.waitForURL(/Survey/);
    await header.goBack();
    await roomOverviewPage.createQuestionSeries('Quiz', 'Quiz');
    await page.waitForURL(/Quiz/);
    await header.goBack();
    await expect(page.getByRole('button', { name: 'Quiz' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Survey' })).toBeVisible();
  });

  test('update room name', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.updateName('My awesome room');
    await header.goBack();
    await expect(page.getByLabel('My awesome room')).toBeVisible();
  });

  test('add room description', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.updateDescription(
      'This is a short discription for this awesome room.'
    );
    await header.goBack();
    await expect(
      page.getByText('This is a short discription for this awesome room.')
    ).toBeVisible();
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
