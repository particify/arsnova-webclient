import { Browser, BrowserContext, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('participant quiz answer overview', () => {
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let participantContext: BrowserContext;
  let participant: ParticipantContentGroupPage;

  async function joinAsParticipant(browser: Browser, baseURL?: string) {
    participantContext = await browser.newContext();
    participant = new ParticipantContentGroupPage(
      await participantContext.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My quiz');
  }

  test.beforeEach(async ({ page, baseURL }) => {
    roomSettings = new RoomSettingsPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My quiz',
      'Quiz'
    );
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createChoiceContent(
      'My first choice content',
      ['a', 'b', 'c'],
      ['b'],
      false,
      false
    );
    await contentCreation.createChoiceContent(
      'My second choice content',
      ['x', 'y'],
      ['x'],
      false,
      false
    );
    const contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    await contentGroupOverview.configure({
      liveMode: false,
      leaderboard: false,
    });
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await participantContext?.close();
    await roomSettings.deleteRoomById(shortId);
  });

  test('answer contents partly correct and show overview', async ({
    browser,
    baseURL,
  }) => {
    await joinAsParticipant(browser, baseURL);
    const page = participant.page;
    await expect(page.getByText('My first choice content')).toBeVisible();
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await expect(page.getByText('My second choice content')).toBeVisible();
    await participant.answerContent(['y']);
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('50%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByText('My first choice content')).toBeVisible();
    await expect(page.getByText('My second choice content')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeVisible();
    await expect(page.getByTestId('wrong-icon')).toBeVisible();
    await expect(page.getByText('you are in 1st place')).toBeHidden();
  });

  test('answer all contents wrong and show overview', async ({
    browser,
    baseURL,
  }) => {
    await joinAsParticipant(browser, baseURL);
    const page = participant.page;
    await participant.answerContent(['a']);
    await participant.goToNextContent();
    await expect(page.getByText('My second choice content')).toBeVisible();
    await participant.answerContent(['y']);
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('0%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeHidden();
    await expect(page.getByTestId('wrong-icon').first()).toBeVisible();
  });

  test('answer all contents correct and show overview', async ({
    browser,
    baseURL,
  }) => {
    await joinAsParticipant(browser, baseURL);
    const page = participant.page;
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await expect(page.getByText('My second choice content')).toBeVisible();
    await participant.answerContent(['x']);
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon').first()).toBeVisible();
    await expect(page.getByTestId('wrong-icon')).toBeHidden();
    await expect(page.getByRole('tab', { name: 'leaderboard' })).toBeHidden();
  });
});
