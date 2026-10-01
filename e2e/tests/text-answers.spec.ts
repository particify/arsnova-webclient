import { Browser, BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('text answers', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  const contexts: BrowserContext[] = [];

  async function answer(
    browser: Browser,
    baseURL: string | undefined,
    text: string
  ) {
    const context = await browser.newContext();
    contexts.push(context);
    const participant = new ParticipantContentGroupPage(
      await context.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My survey');
    await participant.answerTextContent(text);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    return participant;
  }

  function answerItem(page: Page, text: string) {
    return page.getByTestId('text-answer-item').filter({ hasText: text });
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
    await new ContentCreationPage(page, baseURL).createTextContent(
      'My open question'
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

  test('the creator sees every answer', async ({ browser, baseURL }) => {
    await answer(browser, baseURL, 'First answer');
    await answer(browser, baseURL, 'Second answer');
    await creatorPage.getByRole('button', { name: /My open question/ }).click();
    await expect(answerItem(creatorPage, 'First answer')).toBeVisible();
    await expect(answerItem(creatorPage, 'Second answer')).toBeVisible();
  });

  test('participants only see moderated answers once they are published', async ({
    browser,
    baseURL,
  }) => {
    const participant = await answer(browser, baseURL, 'First answer');
    await answer(browser, baseURL, 'Second answer');
    // Answering the only content leads to the overview; the content is reopened from there.
    await participant.page
      .getByRole('button', { name: 'My open question' })
      .last()
      .click();
    await participant.switchToResultsTab();
    await expect(answerItem(participant.page, 'Second answer')).toBeHidden();

    await creatorPage.getByRole('button', { name: /My open question/ }).click();
    await answerItem(creatorPage, 'Second answer').getByRole('button').click();
    await creatorPage
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    const contentItem = creatorPage.getByTestId('content-item').first();
    // The content actions only show while the content is hovered.
    await contentItem.hover();
    await contentItem
      .getByRole('button')
      .filter({ hasText: 'visibility_off' })
      .click();

    await expect(answerItem(participant.page, 'First answer')).toBeVisible();
    await expect(answerItem(participant.page, 'Second answer')).toBeHidden();
  });
});
