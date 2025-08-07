import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';

test.describe('create room for quiz', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let contentCreation: ContentCreationPage;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await expect(page).toHaveTitle(/My quiz/);
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('create quiz series with contents for all quiz types and publish it', async ({
    page,
  }) => {
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false,
      false
    );
    await contentCreation.createBinaryContent('My binary content', 'No');
    await contentCreation.createShortAnswerContent('My short answer content', [
      'abc',
    ]);
    await contentCreation.createSortContent('My sort content', [
      'a',
      'b',
      'c',
      'd',
    ]);
    await contentCreation.createNumericContent(
      'My numeric content',
      -50,
      50,
      42,
      2
    );
    await contentCreation.createSlideContent('My slide content');
    expect(await contentGroupOverview.getContents()).toHaveLength(6);
    await expect(page.getByText('6 contents', { exact: true })).toBeVisible();
    await expect(
      page.getByText('series is hidden for participants')
    ).toBeHidden();
  });

  test('disable live mode', async ({ page }) => {
    await contentCreation.createBinaryContent('My binary content', 'No');
    await contentCreation.createBinaryContent('Another binary content', 'Yes');
    await expect(page.getByText('published up to here')).toBeVisible();
    await expect(page.getByText('Live mode', { exact: true })).toBeVisible();
    await contentGroupOverview.toggleLiveMode();
    await expect(page.getByText('published up to here')).toBeHidden();
    await expect(page.getByText('Live mode', { exact: true })).toBeHidden();
  });

  test('disable leaderboard', async ({ page }) => {
    await expect(page.getByTestId('leaderboard-btn').first()).toBeEnabled();
    await contentGroupOverview.toggleLeaderboard();
    await expect(page.getByTestId('leaderboard-btn').first()).toBeDisabled();
  });
});
