import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';

test.describe('Presentation of a survey', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let contentCreation: ContentCreationPage;
  let presentationModePage: PresentationModePage;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    presentationModePage = new PresentationModePage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    await roomOverviewPage.createQuestionSeries('My survey', 'Survey');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await header.goBack();
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should toggle content results', async ({ page }) => {
    await expect(page.getByText('1 / 1')).toBeVisible();
    await expect(page.getByTestId('content-results-chart')).toBeHidden();
    await presentationModePage.showResults();
    await expect(
      page.getByTestId('content-results-chart'),
      'show chart'
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Correct' }),
      'hide correct options toggle button'
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Leaderboard' }),
      'hide leaderboard toggle button'
    ).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should start multiple rounds', async ({ page }) => {
    await presentationModePage.startNewRound();
    await expect(page.getByText('round has been started')).toBeVisible();
    await presentationModePage.exitPresentation();
  });
});
