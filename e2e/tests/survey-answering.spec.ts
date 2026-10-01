import { Browser, BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('participant answer survey', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let participantContext: BrowserContext;
  let participant: ParticipantContentGroupPage;

  async function joinAsParticipant(
    browser: Browser,
    baseURL?: string,
    index = 1
  ) {
    participantContext = await browser.newContext();
    participant = new ParticipantContentGroupPage(
      await participantContext.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My survey', index);
  }

  test.beforeEach(async ({ page, baseURL }) => {
    creatorPage = page;
    roomSettings = new RoomSettingsPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My survey',
      'Survey'
    );
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createChoiceContent(
      'My choice content',
      ['answer 1', 'answer 2'],
      undefined,
      false,
      false
    );
    await contentCreation.createWordcloudContent('My wordcloud content', 2);
    const contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    await contentGroupOverview.configure({ liveMode: false });
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await participantContext?.close();
    await roomSettings.deleteRoomById(shortId);
  });

  test('answer choice content', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent(['answer 2']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeHidden();
    // Without a correct answer, nothing is right or wrong.
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });

  test('abstain on choice content', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
  });

  test('answer wordcloud content', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL, 2);
    await participant.answerWordcloudContent(['blue', 'green']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
  });

  test('abstain on wordcloud content', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL, 2);
    await participant.answerWordcloudContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
  });

  test('answer contents and show overview', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    const page = participant.page;
    await expect(page.getByText('My choice content')).toBeVisible();
    await participant.answerContent(['answer 1']);
    await expect(page.getByText('My wordcloud content')).toBeVisible();
    await participant.answerWordcloudContent(['blue']);
    await expect(page.getByText('thanks for your participation')).toBeVisible();
    await expect(page.getByText('you are in 1st place')).toBeHidden();
    await expect(page.getByText('points')).toBeHidden();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByText('My choice content')).toBeVisible();
    await expect(page.getByText('My wordcloud content')).toBeVisible();
  });

  test('creator sees the answers in the results', async ({
    browser,
    baseURL,
  }) => {
    await joinAsParticipant(browser, baseURL, 2);
    await participant.answerWordcloudContent(['blue', 'green']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await creatorPage
      .getByRole('button', { name: /My wordcloud content/ })
      .click();
    await expect(creatorPage.getByText('1 answer').first()).toBeVisible();
  });
});
