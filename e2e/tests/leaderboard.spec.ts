import { Browser, BrowserContext, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { waitForOperation } from '@e2e/fixtures/shared/graphql';

test.describe('quiz leaderboard', () => {
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  const contexts: BrowserContext[] = [];

  /**
   * Joins the leaderboard under a nickname, then answers both contents: a
   * leaderboard quiz asks for the nickname before the first answer.
   */
  async function play(
    browser: Browser,
    baseURL: string | undefined,
    nickname: string,
    answers: [string, string]
  ) {
    const context = await browser.newContext();
    contexts.push(context);
    const participant = new ParticipantContentGroupPage(
      await context.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My quiz');
    await Promise.all([
      waitForOperation(participant.page, 'SetRoomUserAlias'),
      participant.joinQuiz(nickname),
    ]);
    await participant.answerContent([answers[0]]);
    await participant.goToNextContent();
    await expect(
      participant.page.getByText('My second choice content')
    ).toBeVisible();
    await participant.answerContent([answers[1]]);
    await participant.getGoToOverviewButton().click();
    await participant.switchToLeaderboardTab();
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
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createChoiceContent(
      'My first choice content',
      ['a', 'b'],
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
    await contentGroupOverview.configure({ liveMode: false });
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    for (const context of contexts.splice(0)) {
      await context.close();
    }
    await roomSettings.deleteRoomById(shortId);
  });

  test('two participants are ranked by their points', async ({
    browser,
    baseURL,
  }) => {
    const first = await play(browser, baseURL, 'Alpha', ['b', 'x']);
    await expect(first.page.getByText(/1st place/)).toBeVisible();
    await expect(first.page.getByRole('table')).toContainText('Alpha');

    const second = await play(browser, baseURL, 'Beta', ['b', 'y']);
    const rows = second.page.getByRole('table').getByRole('row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText('Alpha');
    await expect(rows.nth(1)).toContainText('2nd');
    // Waits rather than asserts once: the ranking with the new nickname is
    // pushed shortly after it was set.
    await expect(rows.nth(1)).toContainText('Beta');
  });

  test('a participant without correct answers is listed with no points', async ({
    browser,
    baseURL,
  }) => {
    const participant = await play(browser, baseURL, 'Gamma', ['a', 'y']);
    const rows = participant.page.getByRole('table').getByRole('row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Gamma');
    await participant.page.getByRole('tab', { name: 'Contents' }).click();
    await expect(
      participant.page.getByRole('button', { name: /^Wrong: / }).first()
    ).toBeVisible();
  });
});
