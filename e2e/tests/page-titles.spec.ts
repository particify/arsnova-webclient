import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('page titles', () => {
  test('show no title on home page', async ({ page, baseURL }) => {
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    expect(page.getByTestId('page-title')).toBeHidden();
  });

  test('show login and register title', async ({ page }) => {
    await page.goto('login');
    await expect(page.getByTestId('page-title')).toContainText('Login');
    await page.getByText('register').click();
    await page.waitForURL(/register/);
    await expect(page.getByTestId('page-title')).toContainText('Register');
  });

  test('show room titles', async ({ page, baseURL }) => {
    const roomSettings = new RoomSettingsPage(page, baseURL);
    const roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    expect(page.getByAltText('My room')).toBeTruthy();
    await roomOverviewPage.createQuestionSeries('Survey', 'Survey');
    await page.waitForURL(/Survey/);
    expect(page.getByAltText('My room')).toBeTruthy();
    expect(page.getByAltText('Survey')).toBeTruthy();
    await page.goBack();
    await roomOverviewPage.goToComments();
    expect(page.getByAltText('My room')).toBeTruthy();
    expect(page.getByAltText('Q&A')).toBeTruthy();
    const header = new Header(page);
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });
});
