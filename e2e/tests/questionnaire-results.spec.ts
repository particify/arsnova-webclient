import { Browser, BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

/** Words of a word cloud are rendered as SVG text. */
function word(page: Page, text: string) {
  return page.locator('svg text').filter({ hasText: text });
}

test.describe('questionnaire results', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let participantContext: BrowserContext;
  let participant: ParticipantContentGroupPage;

  async function answerAsParticipant(browser: Browser, baseURL?: string) {
    participantContext = await browser.newContext();
    participant = new ParticipantContentGroupPage(
      await participantContext.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My survey');
    await participant.answerWordcloudContent(['blue', 'green']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
  }

  test.beforeEach(async ({ page, baseURL }) => {
    creatorPage = page;
    roomSettings = new RoomSettingsPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My survey',
      'Survey'
    );
    await new ContentCreationPage(page, baseURL).createWordcloudContent(
      'My wordcloud content',
      2
    );
    await contentGroupOverview.configure({ liveMode: false });
    await contentGroupOverview.publishContentGroup();
    await page.getByRole('button', { name: /My wordcloud content/ }).click();
  });

  test.afterEach(async () => {
    await participantContext?.close();
    await roomSettings.deleteRoomById(shortId);
  });

  test('results reach the creator without a reload', async ({
    browser,
    baseURL,
  }) => {
    await expect(word(creatorPage, 'blue')).toBeHidden();
    await answerAsParticipant(browser, baseURL);
    await expect(word(creatorPage, 'blue')).toBeVisible();
    await expect(word(creatorPage, 'green')).toBeVisible();
  });

  test('resetting the results clears them', async ({ browser, baseURL }) => {
    await answerAsParticipant(browser, baseURL);
    await expect(word(creatorPage, 'blue')).toBeVisible();
    await contentGroupOverview.openGroupMoreMenu();
    await creatorPage.getByRole('menuitem', { name: 'Reset results' }).click();
    await creatorPage.getByRole('button', { name: 'Delete' }).click();
    await expect(creatorPage.getByText('0 answers').first()).toBeVisible();
  });

  test('participants see the results once statistics are published', async ({
    browser,
    baseURL,
  }) => {
    await answerAsParticipant(browser, baseURL);
    await participant.switchToResultsTab();
    await expect(word(participant.page, 'blue')).toBeVisible();
  });

  test('participants see no results while statistics are unpublished', async ({
    browser,
    baseURL,
  }) => {
    await contentGroupOverview.configure({ statistics: false });
    await answerAsParticipant(browser, baseURL);
    await expect(
      participant.page.getByTestId('content-tab-results')
    ).toBeHidden();
  });
});
