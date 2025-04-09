import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';

test.describe('Presentation of a quiz', () => {
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
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await contentGroupOverview.createContent();
    await contentCreation.createChoiceContent(
      'My choice content',
      ['a', 'b', 'c', 'd'],
      ['b'],
      false,
      false
    );
    await contentCreation.createShortAnswerContent('My short answer content', [
      'abc',
    ]);
    await contentGroupOverview.publishContentGroup();
    await header.goToPresentation();
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should show correct initial state of live content', async ({
    page,
  }) => {
    await expect(
      page.getByText(shortId.slice(0, 4) + ' ' + shortId.slice(4, 8))
    ).toBeVisible();
    await expect(page.getByText('Content1of2')).toBeVisible();
    await expect(page.getByText('1 / 2')).toBeVisible();
    await expect(page.getByText('get ready')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'start the content' })
    ).toBeVisible();
    await expect(page.getByText('My choice content')).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should start and stop contents with live answers', async ({
    page,
    baseURL,
  }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await presentationModePage.startContent();
    await expect(page.getByText('My choice content')).toBeVisible();
    await expect(page.getByText('0 answers').first()).toBeVisible();
    await expect(page.getByText('Live', { exact: true })).toBeVisible();
    await participant.answerContent(['c']);
    await presentationModePage.stopContent();
    await expect(page.getByText('answering is locked')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await presentationModePage.startContent();
    await expect(page.getByText('My short answer content')).toBeVisible();
    await participant.answerTextContent('abc');
    await presentationModePage.showResults();
    await expect(page.getByText('abc')).toBeVisible();
    await presentationModePage.showCorrectResults();
    await expect(
      page.getByTestId('short-answer-correct-indicator')
    ).toBeVisible();
    await expect(page.getByText('1 answer').first()).toBeVisible();
    await presentationModePage.showLeaderboard();
    await expect(
      page.getByText('Leaderboard', { exact: true }).first()
    ).toBeVisible();
    await context.close();
    await presentationModePage.exitPresentation();
  });

  test('should start and stop second content before first one is started', async ({
    page,
    baseURL,
  }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('Content is locked')).toBeVisible();
    await expect(page.getByText('publish content')).toBeVisible();
    await presentationModePage.publishContent();
    await presentationModePage.startContent();
    await participant.answerTextContent('abc');
    await presentationModePage.stopContent();
    await expect(page.getByText('answering is locked')).toBeVisible();
    await context.close();
    await presentationModePage.exitPresentation();
  });

  test('should start multiple rounds', async ({ page }) => {
    await presentationModePage.startContent();
    await presentationModePage.stopContent();
    await presentationModePage.startNewRound();
    await expect(page.getByText('round has been started')).toBeVisible();
    await presentationModePage.startContent();
    await presentationModePage.stopContent();
    await presentationModePage.exitPresentation();
  });

  test('should delete answers', async ({ page, baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await presentationModePage.startContent();
    await participant.answerContent(['c']);
    await presentationModePage.stopContent();
    await presentationModePage.deleteContentAnswers();
    await expect(page.getByText('Content1of2')).toBeVisible();
    await expect(page.getByText('1 / 2')).toBeVisible();
    await expect(page.getByText('get ready')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'start the content' })
    ).toBeVisible();
    await expect(page.getByText('My choice content')).toBeHidden();
    await presentationModePage.exitPresentation();
  });
});
