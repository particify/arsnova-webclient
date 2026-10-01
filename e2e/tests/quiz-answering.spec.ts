import { Browser, BrowserContext, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('participant answer async quiz', () => {
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let contentGroupOverview: ContentGroupOverviewPage;
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
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My quiz',
      'Quiz'
    );
    await new ContentCreationPage(page, baseURL).createChoiceContent(
      'My choice content',
      ['a', 'b', 'c'],
      ['b'],
      false,
      false
    );
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

  test('answer MC content correctly', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent(['b']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });

  test('answer MC content wrong', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent(['a']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeVisible();
  });

  test('abstain on MC content', async ({ browser, baseURL }) => {
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });

  test('answer MC content correctly but correct options are not published', async ({
    browser,
    baseURL,
  }) => {
    await contentGroupOverview.configure({ correctAnswers: false });
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent(['b']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeHidden();
  });

  test('answer MC content wrong but correct options are not published', async ({
    browser,
    baseURL,
  }) => {
    await contentGroupOverview.configure({ correctAnswers: false });
    await joinAsParticipant(browser, baseURL);
    await participant.answerContent(['a']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });
});
