import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';

test.describe('create room with question series', () => {
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
    await roomOverviewPage.createQuestionSeries('My question series', 'Mixed');
    await expect(page).toHaveTitle(/My question series/);
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('create question series with contents of all types and publish it', async ({
    page,
  }) => {
    await contentGroupOverview.createContent();
    await expect(page).toHaveTitle(/Create content/);
    await contentCreation.createChoiceContent(
      'My single choice content',
      ['a', 'b', 'c', 'd'],
      ['b']
    );
    await contentCreation.createChoiceContent(
      'My multiple choice content',
      ['a', 'b', 'c', 'd', 'e', 'f'],
      ['a', 'c'],
      true
    );
    await contentCreation.createChoiceContent(
      'My choice content without correct answer',
      ['a', 'b', 'c', 'd']
    );
    await contentCreation.createLikertContent('My likert content', 'intensity');
    await contentCreation.createLikertContent(
      'My likert content with 4 options',
      'emoji',
      false
    );
    await contentCreation.createBinaryContent('My binary content', 'No');
    await contentCreation.createBinaryContent(
      'My binary content with no correct answer'
    );
    await contentCreation.createTextContent('My text content');
    await contentCreation.createWordcloudContent('My wordcloud content');
    await contentCreation.createSortContent('My sort content', [
      'a',
      'b',
      'c',
      'd',
    ]);
    await contentCreation.createPrioritizationContent(
      'My prioritization content',
      ['a', 'b', 'c', 'd']
    );
    await contentCreation.createNumericContent(
      'My numeric content with correct answer and tolerance',
      -50,
      50,
      42,
      2
    );
    await contentCreation.createNumericContent('My numeric content', -50, 50);
    await contentCreation.createShortAnswerContent('My short answer content', [
      'abc',
    ]);
    await contentCreation.createSlideContent('My slide content');
    await contentCreation.createFlashcardContent(
      'My flashcard content',
      'Back of flashcard'
    );
    await page.goBack();
    expect(await contentGroupOverview.getContents()).toHaveLength(16);
    await expect(page.getByText('16 contents', { exact: true })).toBeVisible();
    await expect(
      page.getByText('series is hidden for participants')
    ).toBeHidden();
  });

  test('create question series with a duplicated content', async ({ page }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b']
    );
    await page.goBack();
    await contentGroupOverview.duplicateContent('My choice content', 0);
    expect(await contentGroupOverview.getContents()).toHaveLength(2);
  });

  test('create two question series with copied contents', async ({ page }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b']
    );
    await contentCreation.createBinaryContent('My binary content');
    await page.goBack();
    await contentGroupOverview.copyContentToNewGroup(
      'My choice content',
      0,
      'Another question series',
      'dashboard'
    );
    await page.goBack();
    expect(page.getByText('Another question series')).toBeVisible();
    expect(page.getByText('1 contents')).toBeVisible();
  });

  test('create two question series with moved contents', async ({ page }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b']
    );
    await contentCreation.createBinaryContent('My binary content');
    await contentCreation.createShortAnswerContent('My short answer content', [
      'abc',
    ]);
    await page.goBack();
    await contentGroupOverview.moveContentToNewGroup(
      'My choice content',
      0,
      'Another question series',
      'dashboard'
    );
    expect(await contentGroupOverview.getContents()).toHaveLength(2);
    await page.goBack();
    expect(page.getByText('Another question series')).toBeVisible();
    expect(page.getByText('1 contents')).toBeVisible();
  });

  test('delete series', async ({ page }) => {
    await contentGroupOverview.deleteGroup(true);
    await expect(page.getByText('series has been deleted')).toBeVisible();
    await expect(page.getByText('My quiz')).toBeHidden();
  });

  test('abort deleting series', async ({ page }) => {
    await contentGroupOverview.deleteGroup();
    await expect(page.getByText('series has been deleted')).toBeHidden();
    await expect(page).toHaveTitle(/My question series/);
  });

  test('lock series and publish it from room overview again', async ({
    page,
  }) => {
    await contentGroupOverview.togglePublishingContentGroup();
    await expect(
      page.getByText('series is hidden for participants')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Publish question series' })
    ).toBeVisible();
    await page.goBack();
    await roomOverviewPage.publishQuestionSeries('My question series');
    await expect(page.getByText('Locked', { exact: true })).toBeHidden();
  });

  test('use range publishing mode', async ({ page }) => {
    await contentGroupOverview.createContent();
    await contentCreation.createTextContent('My text content');
    await contentCreation.createTextContent('Another text content');
    await page.goBack();
    await expect(page.getByText('published up to here')).toBeHidden();
    await contentGroupOverview.usePublishingModeRange();
    await expect(page.getByText('published up to here')).toBeVisible();
    await expect(page.getByText('published up to here')).toBeEnabled();
  });
});
