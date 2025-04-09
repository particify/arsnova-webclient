import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';

test.describe('create room for survey', () => {
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
    await roomOverviewPage.createQuestionSeries('My survey', 'Survey');
    await expect(page).toHaveTitle(/My survey/);
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('create question series with contents of all survey types', async ({
    page,
  }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentCreation.createLikertContent('My likert content', 'intensity');
    await contentCreation.createBinaryContent('My binary content');
    await contentCreation.createTextContent('My text content');
    await contentCreation.createWordcloudContent('My wordcloud content');
    await contentCreation.createPrioritizationContent(
      'My prioritization content',
      ['a', 'b', 'c', 'd']
    );
    await contentCreation.createNumericContent('My numeric content', -50, 50);
    await contentCreation.createSlideContent('My slide content');
    expect(await contentGroupOverview.getContents()).toHaveLength(8);
    await expect(page.getByText('8 contents', { exact: true })).toBeVisible();
    await contentGroupOverview.publishContentGroup();
    await expect(
      page.getByText('series is hidden for participants')
    ).toBeHidden();
  });

  test('enable live mode', async ({ page }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createBinaryContent('My binary content');
    await contentCreation.createBinaryContent('Another binary content');
    await contentGroupOverview.publishContentGroup();
    await contentGroupOverview.toggleLiveMode();
    await expect(page.getByText('published up to here')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Live mode', exact: true })
    ).toBeVisible();
  });
});
