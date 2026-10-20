import {
  Browser,
  BrowserContext,
  ConsoleMessage,
  Page,
  test,
  expect,
} from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

/**
 * Resetting the results replaces every round of the quiz, so the results a
 * presentation shows have to follow the new rounds, whether it is opened
 * again or stays open in another tab.
 */
test.describe('presentation after resetting the results', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  const participantContexts: BrowserContext[] = [];

  async function answerAsNewParticipant(
    browser: Browser,
    baseURL: string | undefined,
    answer: string
  ) {
    const context = await browser.newContext();
    participantContexts.push(context);
    const participant = new ParticipantContentGroupPage(
      await context.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My quiz');
    await participant.answerTextContent(answer);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
  }

  /** The results stay visible across presentations once shown. */
  async function showResults(presentation: PresentationModePage) {
    await presentation.hoverControlBar();
    const resultsButton = presentation.page.getByTestId('results-btn');
    if (!(await resultsButton.getAttribute('class'))?.includes('highlighted')) {
      await presentation.showResults();
    }
    await expect(resultsButton).toHaveClass(/highlighted/);
  }

  /** The errors the GraphQL error link logs about round stats. */
  function collectRoundErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('console', (message: ConsoleMessage) => {
      if (message.type() === 'error' && message.text().includes('RoundStats')) {
        errors.push(message.text());
      }
    });
    return errors;
  }

  test.beforeEach(async ({ page, baseURL }) => {
    creatorPage = page;
    roomSettings = new RoomSettingsPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My quiz',
      'Quiz'
    );
    const contentCreation = new ContentCreationPage(page, baseURL);
    for (const body of [
      'First question',
      'Second question',
      'Third question',
    ]) {
      await contentCreation.createShortAnswerContent(body, ['abc']);
    }
    await contentGroupOverview.configure({
      liveMode: false,
      leaderboard: false,
      publishingMode: 'Range',
    });
    // The range can only be edited on a published series.
    await contentGroupOverview.publishContentGroup();
    await contentGroupOverview.extendPublishedRange(2);
  });

  test.afterEach(async () => {
    for (const context of participantContexts.splice(0)) {
      await context.close();
    }
    await roomSettings.deleteRoomById(shortId);
  });

  test('shows only answers of the new rounds once presented again', async ({
    browser,
    baseURL,
  }) => {
    const header = new Header(creatorPage);
    const presentation = new PresentationModePage(creatorPage, baseURL);
    await answerAsNewParticipant(browser, baseURL, 'old answer');
    await header.goToPresentation();
    await showResults(presentation);
    await expect(creatorPage.getByText('old answer')).toBeVisible();

    await presentation.exitPresentation();
    await creatorPage.getByRole('button', { name: 'My quiz' }).click();
    await contentGroupOverview.resetResults();
    await header.goToPresentation();
    await showResults(presentation);

    await expect(creatorPage.getByText('0 answers').first()).toBeVisible();
    // Results views left open in the creator recover from the deleted rounds
    // before, which the error link logs as well.
    const roundErrors = collectRoundErrors(creatorPage);
    await expect(creatorPage.getByText('old answer')).toBeHidden();
    await answerAsNewParticipant(browser, baseURL, 'new answer');
    await expect(creatorPage.getByText('new answer')).toBeVisible();
    await expect(creatorPage.getByText('Something went wrong.')).toBeHidden();
    expect(roundErrors).toEqual([]);
  });

  test('follows the reset in a presentation left open in another tab', async ({
    browser,
    baseURL,
  }) => {
    const header = new Header(creatorPage);
    await header.goToPresentation();
    await creatorPage.waitForURL(/present/);
    const presentationUrl = creatorPage.url();
    await new PresentationModePage(creatorPage, baseURL).exitPresentation();
    await creatorPage.getByRole('button', { name: 'My quiz' }).click();

    const presentationTab = await creatorPage.context().newPage();
    const presentation = new PresentationModePage(presentationTab, baseURL);
    await presentationTab.goto(presentationUrl);
    await showResults(presentation);
    await answerAsNewParticipant(browser, baseURL, 'old answer');
    await expect(presentationTab.getByText('old answer')).toBeVisible();

    await contentGroupOverview.resetResults();

    await expect(presentationTab.getByText('old answer')).toBeHidden();
    await answerAsNewParticipant(browser, baseURL, 'new answer');
    await expect(presentationTab.getByText('new answer')).toBeVisible();
    await expect(
      presentationTab.getByText('Something went wrong.')
    ).toBeHidden();
    await presentationTab.close();
  });
});
