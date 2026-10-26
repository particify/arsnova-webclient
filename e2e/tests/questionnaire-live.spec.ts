import { Browser, BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { QuestionnaireContentListPage } from '@e2e/fixtures/creator/questionnaire-content-list';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { QuestionnairePage } from '@e2e/fixtures/participant/questionnaire-page';
import { HeldGraphqlWs } from '@e2e/api/held-graphql-ws';
import { PageProblems } from '@e2e/fixtures/shared/page-problems';

test.describe('questionnaire live mode with a real backend', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let contentGroupOverview: ContentGroupOverviewPage;
  let participantContext: BrowserContext;
  let participant: QuestionnairePage;

  async function setUp(
    page: Page,
    baseURL: string | undefined,
    name: string,
    type: string
  ) {
    creatorPage = page;
    roomSettings = new RoomSettingsPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      name,
      type
    );
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createChoiceContent(
      'My first choice content',
      ['a', 'b'],
      type === 'Quiz' ? ['b'] : undefined,
      false,
      false
    );
    await contentCreation.createChoiceContent(
      'My second choice content',
      ['x', 'y'],
      type === 'Quiz' ? ['x'] : undefined,
      false,
      false
    );
  }

  async function join(
    browser: Browser,
    baseURL: string | undefined,
    name: string
  ) {
    participantContext = await browser.newContext();
    const page = await participantContext.newPage();
    await new ParticipantContentGroupPage(page, baseURL).goto(shortId, name);
    participant = new QuestionnairePage(page, baseURL);
  }

  test.afterEach(async () => {
    await participantContext?.close();
    await roomSettings.deleteRoomById(shortId);
  });

  test.describe('live', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await setUp(page, baseURL, 'My quiz', 'Quiz');
      await contentGroupOverview.configure({ leaderboard: false });
      await contentGroupOverview.publishContentGroup();
    });

    test('a started content replaces the waiting area', async ({
      browser,
      baseURL,
    }) => {
      await join(browser, baseURL, 'My quiz');
      await expect(participant.getSubmitButton()).toBeHidden();
      await contentGroupOverview.startContent('My first choice content', 0);
      await expect(
        participant.getContentBody('My first choice content')
      ).toBeVisible();
      await expect(participant.getSubmitButton()).toBeVisible();
    });

    test('an answer to a started content reaches the creator', async ({
      browser,
      baseURL,
    }) => {
      await contentGroupOverview.startContent('My first choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await participant.answerContent(['b']);
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await expect(creatorPage.getByText('1 answer').first()).toBeVisible();
    });

    test('stopping a content locks answering', async ({ browser, baseURL }) => {
      await contentGroupOverview.startContent('My first choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await expect(participant.getSubmitButton()).toBeVisible();
      await contentGroupOverview.stopContent(0);
      await expect(
        participant.getHintAfterContentStoppedWithoutAnswering()
      ).toBeVisible();
      await expect(participant.getSubmitButton()).toBeHidden();
    });

    test('an answer sent after the round was stopped is rejected', async ({
      browser,
      baseURL,
    }) => {
      await contentGroupOverview.startContent('My first choice content', 0);
      participantContext = await browser.newContext();
      const page = await participantContext.newPage();
      const pushes = new HeldGraphqlWs(page);
      await pushes.install();
      await new ParticipantContentGroupPage(page, baseURL).goto(
        shortId,
        'My quiz'
      );
      participant = new QuestionnairePage(page, baseURL);
      await expect(participant.getSubmitButton()).toBeVisible();
      const problems = await PageProblems.record(page);

      // The stop has not reached the participant yet when they submit.
      pushes.hold();
      await contentGroupOverview.stopContent(0);
      await participant.answerContent(['b']);

      // The backend rejects an answer to a closed round as a bad request.
      await expect
        .poll(() => problems.snackbarTexts())
        .toEqual([expect.stringContaining('Your request is invalid.')]);
      await expect(participant.getHintAfterAnswering()).toBeHidden();
      pushes.release();
      await expect(
        participant.getHintAfterContentStoppedWithoutAnswering()
      ).toBeVisible();
      await expect(creatorPage.getByText('0 answers').first()).toBeVisible();
    });

    test('starting the next content moves the participant along', async ({
      browser,
      baseURL,
    }) => {
      await contentGroupOverview.startContent('My first choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await participant.answerContent(['b']);
      await contentGroupOverview.stopContent(0);
      await contentGroupOverview.startContent('My second choice content', 1);
      await expect(
        participant.getContentBody('My second choice content')
      ).toBeVisible();
      await expect(participant.getSubmitButton()).toBeVisible();
    });
  });

  test.describe('countdown', () => {
    test('the timer running out locks answering', async ({
      page,
      browser,
      baseURL,
    }) => {
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
      await contentCreation.selectFormat('Multiple choice');
      await contentCreation.setTimer(10);
      await contentCreation.createChoiceContent(
        'My timed choice content',
        ['a', 'b'],
        ['b'],
        false,
        false
      );
      await contentGroupOverview.configure({ leaderboard: false });
      await contentGroupOverview.publishContentGroup();
      await contentGroupOverview.startContent('My timed choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await expect(participant.getSubmitButton()).toBeEnabled();
      // The shortest timer the form allows is 10 seconds.
      await expect(
        participant.getHintAfterContentStoppedWithoutAnswering()
      ).toBeVisible({ timeout: 20000 });
      await expect(participant.getSubmitButton()).toBeHidden();
    });
  });

  test.describe('rounds', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await setUp(page, baseURL, 'My quiz', 'Quiz');
      await contentGroupOverview.configure({ leaderboard: false });
      await contentGroupOverview.publishContentGroup();
    });

    test('a new round lets the participant answer again', async ({
      browser,
      baseURL,
    }) => {
      const contentList = new QuestionnaireContentListPage(creatorPage);
      await contentGroupOverview.startContent('My first choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await participant.answerContent(['b']);
      await expect(participant.getHintAfterAnswering()).toBeVisible();
      await contentGroupOverview.stopContent(0);
      // Starting a new round starts the content, too.
      await contentList.startNewRound(0);
      await expect(participant.getHintAfterAnswering()).toBeHidden();
      await expect(participant.getSubmitButton()).toBeEnabled();
    });
  });

  test.describe('deep links', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await setUp(page, baseURL, 'My quiz', 'Quiz');
      await contentGroupOverview.configure({ leaderboard: false });
      await contentGroupOverview.publishContentGroup();
    });

    test('a link to an earlier content enters at the started one', async ({
      browser,
      baseURL,
    }) => {
      await contentGroupOverview.startContent('My first choice content', 0);
      await join(browser, baseURL, 'My quiz');
      await expect(
        participant.getContentBody('My first choice content')
      ).toBeVisible();
      const firstContentUrl = participant.page.url();
      await contentGroupOverview.stopContent(0);
      await contentGroupOverview.startContent('My second choice content', 1);
      const linkContext = await browser.newContext();
      try {
        const page = await linkContext.newPage();
        await page.goto(firstContentUrl);
        await expect(page.getByText('My second choice content')).toBeVisible();
        await expect(page.getByText('My first choice content')).toBeHidden();
      } finally {
        await linkContext.close();
      }
    });
  });

  test.describe('range', () => {
    test.beforeEach(async ({ page, baseURL }) => {
      await setUp(page, baseURL, 'My survey', 'Survey');
      await contentGroupOverview.configure({
        liveMode: false,
        publishingMode: 'Range',
      });
      await contentGroupOverview.publishContentGroup();
    });

    test('participants only see the published range', async ({
      browser,
      baseURL,
    }) => {
      await expect(creatorPage.getByText('Published up to here')).toBeVisible();
      await join(browser, baseURL, 'My survey');
      await expect(
        participant.getContentBody('My first choice content')
      ).toBeVisible();
      // Contents beyond the range are listed, but locked.
      await expect(participant.getStepButton(2)).toBeDisabled();
    });

    test('releasing the next content reaches the participant', async ({
      browser,
      baseURL,
    }) => {
      await join(browser, baseURL, 'My survey');
      await expect(
        participant.getContentBody('My first choice content')
      ).toBeVisible();
      // The divider moves with the keyboard as well as by dragging.
      await creatorPage.locator('.locked-divider-container').focus();
      await expect(participant.getStepButton(2)).toBeDisabled();
      await creatorPage.keyboard.press('Control+ArrowDown');
      await expect(participant.getStepButton(2)).toBeEnabled();
    });
  });
});
