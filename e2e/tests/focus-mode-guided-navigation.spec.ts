import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomOverviewPage as ParticipantRoomOverviewPage } from '@e2e/fixtures/participant/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';

test.describe('focus mode guided navigation', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverview: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let contentCreation: ContentCreationPage;
  let presentationMode: PresentationModePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverview = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    presentationMode = new PresentationModePage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);

    await header.goToSettings();
    await roomSettings.enableFocusMode();
    await roomSettings.saveRoomDetails();
    await page.goBack();

    await roomOverview.createQuestionSeries('My survey', 'Survey');
    await expect(page).toHaveTitle(/My survey/);
    await contentCreation.createTextContent('First question');
    await contentCreation.createTextContent('Second question');
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await roomSettings.deleteRoomById(shortId);
  });

  test('participants follow the presenter without an intervening reload', async ({
    page,
    baseURL,
    browser,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);

    const context = await browser.newContext();
    const p = await context.newPage();
    const participantRoom = new ParticipantRoomOverviewPage(p, baseURL);
    await participantRoom.goto(shortId);

    await expect(p.getByText('First question')).toBeVisible();

    await presentationMode.goToNextContent();
    await expect(p.getByText('Second question')).toBeVisible();

    await presentationMode.goToPreviousContent();
    await expect(p.getByText('First question')).toBeVisible();
    await context.close();
  });

  test('the toggle still reads as enabled when settings are reopened', async () => {
    await header.goToSettings();
    await expect(roomSettings.getFocusModeToggle()).toBeChecked();
  });
});
