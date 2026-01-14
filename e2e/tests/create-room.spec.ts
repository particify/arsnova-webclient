import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('create room', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    header = new Header(page);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('Q&A and Live Feedback are visible', async ({ page }) => {
    await expect(
      page.locator('#routing-content').getByText('Q&A', { exact: true })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Q&A' })).toBeVisible();
    await expect(
      page
        .locator('#routing-content')
        .getByText('Live Feedback', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Open Live Feedback' })
    ).toBeVisible();
  });

  test('create two question series', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('Survey', 'Survey');
    await page.waitForURL(/Survey/);
    await page.goBack();
    await roomOverviewPage.createQuestionSeries('Quiz', 'Quiz');
    await page.waitForURL(/Quiz/);
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Quiz' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Survey' })).toBeVisible();
  });

  test('preview shows welcome card', async ({ page }) => {
    await header.switchRole();
    await expect(page.getByText('Welcome to', { exact: true })).toBeVisible();
    await expect(page.getByText('My room', { exact: true })).toBeVisible();
    await expect(
      page.getByText(shortId.slice(0, 4) + ' ' + shortId.slice(4, 8))
    ).toBeVisible();
    await header.switchRole();
  });
});
