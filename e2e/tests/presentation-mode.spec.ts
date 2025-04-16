import { chromium, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';

test.describe('presentation mode', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let presentationModePage: PresentationModePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    presentationModePage = new PresentationModePage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('open room in presentation mode', async ({ page }) => {
    await header.goToPresentation();
    await expect(page).toHaveTitle(/Presentation/);
    await expect(page.getByText('localhost:')).toBeVisible();
    await expect(page.getByText('1', { exact: true })).toBeVisible();
    await expect(page.locator('qr-code')).toBeVisible();
    await expect(
      page.getByText(shortId.slice(0, 4) + ' ' + shortId.slice(4, 8))
    ).toBeVisible();
    await presentationModePage.exitPresentation();
    await expect(page).toHaveTitle(/My room/);
  });

  test('copy url to clipboard and join in new context', async ({ page }) => {
    await header.goToPresentation();
    await expect(page).toHaveTitle(/Presentation/);
    await presentationModePage.copyUrl();
    const urlFromClipboard = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    await presentationModePage.exitPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    await p.goto(urlFromClipboard);
    await expect(p).toHaveTitle(/My room/);
    await context.close();
  });

  test('open presentation mode from settings', async ({ page, baseURL }) => {
    await header.goToSettings();
    await page.waitForURL(/settings/);
    await header.goToPresentation();
    await expect(page).toHaveURL(baseURL + '/present/' + shortId);
    await presentationModePage.exitPresentation();
  });

  test('open presentation mode from question series', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('Survey', 'Survey');
    await page.waitForURL(/Survey/);
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('publish the question series')).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('open presentation mode from Q&A', async ({ page, baseURL }) => {
    await roomOverviewPage.goToComments();
    await page.waitForURL(/comments/);
    await header.goToPresentation();
    await expect(page).toHaveURL(baseURL + '/present/' + shortId + '/comments');
    await presentationModePage.exitPresentation();
  });

  test('open presentation mode from live feedback', async ({
    page,
    baseURL,
  }) => {
    await roomOverviewPage.goToLiveFeedback();
    await page.waitForURL(/feedback/);
    await header.goToPresentation();
    await expect(page).toHaveURL(baseURL + '/present/' + shortId + '/feedback');
    await presentationModePage.exitPresentation();
  });

  test('go into fullscreen mode', async ({ page }) => {
    await header.goToPresentation();
    await presentationModePage.openFullScreen();
    await page.keyboard.press('Escape');
    await presentationModePage.exitPresentation();
  });

  test('navigate to Q&A', async ({ page }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await expect(page).toHaveURL(/comments/);
    await presentationModePage.exitPresentation();
  });

  test('navigate to live feedback', async ({ page }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToLiveFeedback();
    await expect(page).toHaveURL(/feedback/);
    await presentationModePage.exitPresentation();
  });

  test('navigate to series', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('Survey', 'Survey');
    await page.waitForURL(/Survey/);
    await page.goBack();
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToQuestionSeries();
    await expect(page).toHaveURL(/series/);
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('publish the question series')).toBeHidden();
    await presentationModePage.exitPresentation();
  });
});
