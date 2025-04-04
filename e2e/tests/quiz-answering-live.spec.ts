import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('live quiz with MC and short answer content', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverviewPage: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let contentCreation: ContentCreationPage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverviewPage = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    await roomOverviewPage.createQuestionSeries('My quiz', 'Quiz');
    await expect(page).toHaveTitle(/My quiz/);
    await contentGroupOverview.createContent();
    await expect(page).toHaveTitle(/Create content/);
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
    await page.goBack();
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('answer MC content correct', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await contentGroupOverview.startContent('My choice content', 0);
    await participant.answerContent(['b']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await context.close();
  });

  test('answer MC content incorrect', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await contentGroupOverview.startContent('My choice content', 0);
    await participant.answerContent(['c']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await context.close();
  });

  test('answer MC content multiple rounds', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await contentGroupOverview.startContent('My choice content', 0);
    await participant.answerContent(['c']);
    await contentGroupOverview.stopContent(0);
    await contentGroupOverview.startContent('My choice content', 0);
    await expect(p.getByText('new round has been started')).toBeVisible();
    await participant.answerContent(['b']);
    await context.close();
  });

  test('abstain MC content', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await contentGroupOverview.startContent('My choice content', 0);
    await participant.answerContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
    await context.close();
  });

  test('should hide answer button if stopped', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantContentGroupPage(p, baseURL);
    await participant.goto(shortId, 'My quiz');
    await participant.joinQuiz();
    await contentGroupOverview.startContent('My choice content', 0);
    await expect(participant.getSubmitButton()).toBeVisible();
    await contentGroupOverview.stopContent(0);
    await expect(participant.getSubmitButton()).toBeHidden();
    await expect(
      participant.getHintAfterContentStoppedWithoutAnswering()
    ).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeDisabled();
    await context.close();
  });
});
