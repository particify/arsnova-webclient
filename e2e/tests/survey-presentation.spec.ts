import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('Presentation of a survey', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let contentCreation: ContentCreationPage;
  let presentationModePage: PresentationModePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    presentationModePage = new PresentationModePage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    await roomOverviewPage.createQuestionSeries('My survey', 'Survey');
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should toggle content results', async ({ page }) => {
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
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

  test('should start multiple rounds for MC content', async ({
    page,
    baseURL,
  }) => {
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerContent(['c']);
    await expect(page.getByText('1 answer').first()).toBeVisible();
    await presentationModePage.startNewRound();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await expect(page.getByText('round has been started')).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.exitPresentation();
  });

  test('should delete answers of MC content', async ({ page, baseURL }) => {
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      undefined,
      false,
      false
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerContent(['c']);
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should delete answers of likert content', async ({ page, baseURL }) => {
    await contentCreation.createLikertContent('My likert content', 'agreement');
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerContent(['Somewhat agree']);
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should delete answers of binary content', async ({ page, baseURL }) => {
    await contentCreation.createBinaryContent('My binary content');
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerContent(['Yes']);
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should delete answers of text content', async ({ page, baseURL }) => {
    await contentCreation.createTextContent('My text content');
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerTextContent('Text answer');
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should delete answers of wordcloud content', async ({
    page,
    baseURL,
  }) => {
    await contentCreation.createWordcloudContent('My wordcloud content');
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerWordcloudContent(['Hello', 'Test', 'Hi']);
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should delete answers of prioritization content', async ({
    page,
    baseURL,
  }) => {
    await contentCreation.createPrioritizationContent(
      'My prioritization content',
      ['a', 'b', 'c', 'd']
    );
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerPrioritizationContent([10, 20, 50, 20]);
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });

  test('should start multiple rounds for numeric content', async ({
    page,
    baseURL,
  }) => {
    await contentCreation.createNumericContent('My numeric content', 0, 100);
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerTextContent('42');
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.startNewRound();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await expect(page.getByText('round has been started')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should delete answers of numeric content', async ({
    page,
    baseURL,
  }) => {
    await contentCreation.createNumericContent('My numeric content', 0, 100);
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My survey');
    await participant.answerTextContent('42');
    await expect(page.getByText('1 answer').first()).toBeVisible({
      timeout: 7_500,
    });
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await presentationModePage.exitPresentation();
    await context.close();
  });
});
