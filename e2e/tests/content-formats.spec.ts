import { Browser, BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

/**
 * Each format: the creator creates a content, a participant answers it, and
 * the result reaches both sides.
 */
test.describe('content formats', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let contentCreation: ContentCreationPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let participantContext: BrowserContext | undefined;
  let seriesType: string;

  async function createSeries(
    page: Page,
    baseURL: string | undefined,
    type: string
  ) {
    creatorPage = page;
    seriesType = type;
    roomSettings = new RoomSettingsPage(page, baseURL);
    contentCreation = new ContentCreationPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My series',
      type
    );
  }

  async function publish(settings: { correctAnswers?: boolean } = {}) {
    await contentGroupOverview.configure({
      liveMode: false,
      // Only quizzes have a leaderboard, which would ask for a nickname first.
      leaderboard: seriesType === 'Quiz' ? false : undefined,
      ...settings,
    });
    await contentGroupOverview.publishContentGroup();
  }

  async function join(browser: Browser, baseURL: string | undefined) {
    participantContext = await browser.newContext();
    const participant = new ParticipantContentGroupPage(
      await participantContext.newPage(),
      baseURL
    );
    await participant.goto(shortId, 'My series');
    return participant;
  }

  async function expectAnswerCount(count: number) {
    await expect(
      creatorPage.getByText(`${count} answer${count === 1 ? '' : 's'}`).first()
    ).toBeVisible();
  }

  test.afterEach(async () => {
    await participantContext?.close();
    participantContext = undefined;
    await roomSettings.deleteRoomById(shortId);
  });

  test.describe('numeric', () => {
    function verdict(
      participant: ParticipantContentGroupPage,
      icon: 'check' | 'close'
    ) {
      return participant.page
        .locator('app-content-numeric-answer mat-icon')
        .filter({ hasText: icon });
    }

    async function answerNumber(
      participant: ParticipantContentGroupPage,
      value: number
    ) {
      const page = participant.page;
      await page.getByTestId('numeric-answer-input').fill(String(value));
      await participant.getSubmitButton().click();
      await expect(participant.getHintAfterAnswering()).toBeVisible();
    }

    test.beforeEach(async ({ page, baseURL }) => {
      await createSeries(page, baseURL, 'Quiz');
      await contentCreation.createNumericContent(
        'My numeric content',
        -50,
        50,
        42,
        2
      );
    });

    test('an answer within the tolerance is correct', async ({
      browser,
      baseURL,
    }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await answerNumber(participant, 41);
      await expect(verdict(participant, 'check')).toBeVisible();
      await expect(
        participant.page.getByText('The correct answer is')
      ).toBeVisible();
      await expectAnswerCount(1);
    });

    test('an answer outside the tolerance is wrong', async ({
      browser,
      baseURL,
    }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await answerNumber(participant, 30);
      await expect(verdict(participant, 'close')).toBeVisible();
    });

    test('the solution is withheld until correct answers are published', async ({
      browser,
      baseURL,
    }) => {
      await publish({ correctAnswers: false });
      const participant = await join(browser, baseURL);
      await answerNumber(participant, 41);
      await expect(
        participant.page.getByText('The correct answer is')
      ).toBeHidden();
      await expect(verdict(participant, 'check')).toBeHidden();
    });
  });

  test.describe('likert', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await createSeries(page, baseURL, 'Survey');
      await contentCreation.createLikertContent(
        'My likert content',
        'Agreement'
      );
      await publish();
    });

    test('an answer reaches the creator', async ({ browser, baseURL }) => {
      const participant = await join(browser, baseURL);
      await participant.answerLikertContent('Strongly agree');
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expectAnswerCount(1);
    });

    test('a participant can abstain', async ({ browser, baseURL }) => {
      const participant = await join(browser, baseURL);
      await participant.answerLikertContent();
      await expect(participant.getHintAfterAbstaining()).toBeVisible();
    });
  });

  test.describe('short answer', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await createSeries(page, baseURL, 'Quiz');
      await contentCreation.createShortAnswerContent(
        'My short answer content',
        ['abc']
      );
    });

    test('a matching term is correct and the terms are shown', async ({
      browser,
      baseURL,
    }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await participant.answerTextContent('abc');
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expect(
        participant.page.getByTestId('text-answer-correct')
      ).toBeVisible();
      await expect(
        participant.page.getByTestId('short-answer-correct-terms')
      ).toContainText('abc');
      await expectAnswerCount(1);
    });

    test('another term is wrong', async ({ browser, baseURL }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await participant.answerTextContent('xyz');
      await expect(
        participant.page.getByTestId('text-answer-wrong')
      ).toBeVisible();
    });

    test('the terms are withheld until correct answers are published', async ({
      browser,
      baseURL,
    }) => {
      await publish({ correctAnswers: false });
      const participant = await join(browser, baseURL);
      await participant.answerTextContent('abc');
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expect(
        participant.page.getByTestId('short-answer-correct-terms')
      ).toBeHidden();
      await expect(
        participant.page.getByTestId('text-answer-correct')
      ).toBeHidden();
    });

    test('a participant can abstain', async ({ browser, baseURL }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await participant.answerTextContent();
      await expect(participant.getHintAfterAbstaining()).toBeVisible();
    });
  });

  test.describe('sort', () => {
    const correctOrder = ['Mercury', 'Venus', 'Earth', 'Mars'];

    /**
     * Brings the items into the given order with the keyboard. The order the
     * participant starts from is a shuffle of the shuffled storage order, so it
     * is read from the page rather than assumed.
     */
    async function arrange(page: Page, order: string[]) {
      const items = page.locator('app-content-sort-answer [cdkdrag]');
      const labels = async () =>
        (await items.allInnerTexts()).map((text) =>
          text.replace('drag_handle', '').trim()
        );
      // The list re-renders and refocuses after every move, so the next move is
      // always derived from the order shown now.
      await expect(async () => {
        const shown = await labels();
        const target = shown.findIndex((label, i) => label !== order[i]);
        if (target >= 0) {
          await items.nth(shown.indexOf(order[target])).focus();
          await page.keyboard.press('ArrowUp');
        }
        expect(await labels()).toEqual(order);
      }).toPass({ timeout: 20000 });
    }

    test.beforeEach(async ({ page, baseURL }) => {
      await createSeries(page, baseURL, 'Quiz');
      await contentCreation.createSortContent('My sort content', correctOrder);
    });

    test('the creator order is the correct one', async ({
      browser,
      baseURL,
    }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await arrange(participant.page, correctOrder);
      await participant.getSubmitButton().click();
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expect(
        participant.page.getByTestId('sort-answer-correct')
      ).toBeVisible();
      await expectAnswerCount(1);
    });

    test('another order is wrong', async ({ browser, baseURL }) => {
      await publish();
      const participant = await join(browser, baseURL);
      await arrange(participant.page, [...correctOrder].reverse());
      await participant.getSubmitButton().click();
      await expect(
        participant.page.getByTestId('sort-answer-wrong')
      ).toBeVisible();
    });

    test('the correct order is withheld until correct answers are published', async ({
      browser,
      baseURL,
    }) => {
      await publish({ correctAnswers: false });
      const participant = await join(browser, baseURL);
      await arrange(participant.page, correctOrder);
      await participant.getSubmitButton().click();
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expect(
        participant.page.getByTestId('sort-answer-correct')
      ).toBeHidden();
    });

    test('editing keeps the creator order', async () => {
      // Reloaded so the order comes from the server, not the creation form.
      await creatorPage.reload();
      const contentItem = creatorPage.getByTestId('content-item').first();
      await contentItem.hover();
      await contentItem
        .getByRole('button')
        .filter({ hasText: /^edit$/ })
        .click();
      await creatorPage.waitForURL(/\/edit\/[^/]+$/);
      for (const [index, label] of correctOrder.entries()) {
        await expect(
          creatorPage.getByPlaceholder('item ' + (index + 1))
        ).toHaveValue(label);
      }
    });
  });

  test.describe('prioritization', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await createSeries(page, baseURL, 'Survey');
      await contentCreation.createPrioritizationContent(
        'My prioritization content',
        ['More exercises', 'Shorter lectures', 'Recorded sessions']
      );
      await publish();
    });

    test('distributed points reach the creator, ranked', async ({
      browser,
      baseURL,
    }) => {
      const participant = await join(browser, baseURL);
      await participant.answerPrioritizationContent([20, 30, 50]);
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await creatorPage
        .getByRole('button', { name: /My prioritization content/ })
        .click();
      await expect(creatorPage.getByTestId('bar-value')).toHaveText([
        '50',
        '30',
        '20',
      ]);
    });

    test('points must add up to the budget', async ({ browser, baseURL }) => {
      const participant = await join(browser, baseURL);
      await participant.answerPrioritizationContent([20, 30, 10]);
      await expect(participant.getHintAfterAnswering()).toBeHidden();
      await expect(participant.getSubmitButton()).toBeEnabled();
    });
  });
});
