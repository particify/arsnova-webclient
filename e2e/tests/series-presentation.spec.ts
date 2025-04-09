import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';

test.describe('Presentation of a question series', () => {
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
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should publish series with confirmation dialog', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false,
      false
    );
    await header.goToPresentation();
    await expect(
      page.getByText('Would you like to publish the question series?')
    ).toBeVisible();
    await expect(page.getByText('Group is not published.')).toBeVisible();
    await presentationModePage.publishContentGroup(undefined, true);
    await expect(page.getByText('Content1of1')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should publish series with publishing mode range in confirmation dialog', async ({
    page,
  }) => {
    await roomOverviewPage.createQuestionSeries('My question series', 'Mixed');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false
    );
    await header.goToPresentation();
    await expect(
      page.getByText('How would you like to publish the question series?')
    ).toBeVisible();
    await expect(page.getByText('Group is not published.')).toBeVisible();
    await presentationModePage.publishContentGroup('range');
    await expect(page.getByText('My choice content')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should publish content by content when using range', async ({
    page,
  }) => {
    await roomOverviewPage.createQuestionSeries('My survey', 'Survey');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentCreation.createLikertContent('My likert content', 'agreement');
    await header.goToPresentation();
    await presentationModePage.publishContentGroup('range');
    await expect(page.getByText('My choice content')).toBeVisible();
    await presentationModePage.goToNextContent();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByText('My likert content')).toBeVisible();
    await presentationModePage.publishContent();
    await expect(page.getByText('Content is locked')).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should publish content between published and newly published when using range', async ({
    page,
  }) => {
    await roomOverviewPage.createQuestionSeries('My survey', 'Survey');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentCreation.createLikertContent('My likert content', 'agreement');
    await contentCreation.createLikertContent(
      'Another likert content',
      'agreement'
    );
    await header.goToPresentation();
    await presentationModePage.publishContentGroup('range');
    await expect(page.getByText('My choice content')).toBeVisible();
    await presentationModePage.goToNextContent();
    await expect(page.getByText('Content is locked')).toBeVisible();
    await presentationModePage.goToNextContent();
    await expect(page.getByText('Content is locked')).toBeVisible();
    await expect(page.getByText('Another likert content')).toBeVisible();
    await presentationModePage.publishContent();
    await expect(page.getByText('Content is locked')).toBeHidden();
    await presentationModePage.goToPreviousContent();
    await expect(page.getByText('Content is locked')).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should go to content edit', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false,
      false
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    await presentationModePage.goToContentEdit();
    await expect(page).toHaveURL(/series\/My%20quiz\/edit\//);
  });

  test('should go to display settings', async ({ page }) => {
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false,
      false
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    await presentationModePage.goToDisplaySettings();
    await expect(page).toHaveURL(/account\/preferences/);
    await page.goBack();
    await presentationModePage.exitPresentation();
  });
});
