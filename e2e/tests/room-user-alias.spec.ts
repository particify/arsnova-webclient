import { Browser, BrowserContext, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('room user alias', () => {
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let participantContext: BrowserContext | undefined;

  async function join(browser: Browser, baseURL: string | undefined) {
    participantContext = await browser.newContext();
    const participant = new ParticipantContentGroupPage(
      await participantContext.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My quiz');
    return participant;
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
    await new ContentCreationPage(page, baseURL).createChoiceContent(
      'My choice content',
      ['a', 'b'],
      ['b'],
      false,
      false
    );
    // A quiz has its leaderboard enabled, so participants join with a nickname.
    await new ContentGroupOverviewPage(page, baseURL).publishContentGroup();
  });

  test.afterEach(async () => {
    await participantContext?.close();
    participantContext = undefined;
    await roomSettings.deleteRoomById(shortId);
  });

  test('a chosen nickname is set once and kept', async ({
    browser,
    baseURL,
  }) => {
    const participant = await join(browser, baseURL);
    await participant.joinQuiz('Quiz Wizard');
    await expect(
      participant.page.getByText('Get ready, Quiz Wizard!')
    ).toBeVisible();
    await participant.page.reload();
    await expect(
      participant.page.getByText('Get ready, Quiz Wizard!')
    ).toBeVisible();
    await expect(participant.page.getByTestId('nickname-input')).toBeHidden();
  });

  test('the proposed nickname can be taken as is', async ({
    browser,
    baseURL,
  }) => {
    const participant = await join(browser, baseURL);
    const proposal = await participant.page
      .getByTestId('nickname-input')
      .getAttribute('placeholder');
    expect(proposal).toBeTruthy();
    await participant.joinQuiz();
    await expect(
      participant.page.getByText(`Get ready, ${proposal}!`)
    ).toBeVisible();
  });
});
