import { test, expect, Page } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { QuestionnaireContentListPage } from '@e2e/fixtures/creator/questionnaire-content-list';
import { QuestionnaireContentResultsPage } from '@e2e/fixtures/creator/questionnaire-content-results';

async function createChoiceContent(page: Page, body: string) {
  await page.getByTestId('format-selection').click();
  await page.getByRole('option').getByText('Multiple choice').first().click();
  await page.getByRole('textbox', { name: 'Content' }).fill(body);
  await page.getByPlaceholder('option 1').fill('Option A');
  await page.getByPlaceholder('option 2').fill('Option B');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  const contentItem = page.getByTestId('content-item').first();
  await contentItem.waitFor();
  await contentItem.click();
}

test.describe('questionnaire content rounds', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let roomOverview: RoomOverviewPage;
  let contentList: QuestionnaireContentListPage;
  let contentResults: QuestionnaireContentResultsPage;
  let shortId: string;
  let questionnaireId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    roomOverview = new RoomOverviewPage(page, baseURL);
    contentList = new QuestionnaireContentListPage(page);
    contentResults = new QuestionnaireContentResultsPage(page);

    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    questionnaireId = await roomOverview.createQuestionnaire(
      'My questionnaire',
      'Survey'
    );
    await createChoiceContent(page, 'My choice content');
  });

  test.afterEach(async ({ page }) => {
    await page.keyboard.press('Escape');
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('a content without a second round shows no round selector', async () => {
    await expect(contentList.contentItem(0)).toBeVisible();
    await expect(contentResults.roundSelectorButton()).toBeHidden();
  });

  test('starting a new round from the content list adds a second, selectable round', async () => {
    await expect(contentResults.roundSelectorButton()).toBeHidden();

    await contentList.startNewRound(0);

    await expect(contentResults.roundSelectorButton()).toHaveText('Round 2');
    await contentResults.openRoundSelector();
    await expect(contentResults.roundMenuItem(1)).toBeVisible();
    await expect(contentResults.roundMenuItem(2)).toBeVisible();
  });

  test('comparing a non-adjacent pair of rounds shows both in the selector label', async () => {
    await contentList.startNewRound(0);
    await contentList.startNewRound(0);
    await expect(contentResults.roundSelectorButton()).toHaveText('Round 3');

    await contentResults.openRoundSelector();
    await contentResults.roundMenuItem(1).click();

    await expect(contentResults.roundSelectorButton()).toHaveText(
      'Round 1 & 3'
    );
  });

  test('outside live mode, starting a new round and deleting answers stay enabled regardless of round state', async () => {
    await contentList.openMoreMenu(0);
    await expect(contentList.startNewRoundMenuItem()).toBeEnabled();
    await expect(contentList.deleteAnswersMenuItem()).toBeEnabled();
  });

  test('in live mode, starting a new round and deleting answers are disabled while the round is open', async ({
    page,
  }) => {
    await contentList.toggleLiveMode();
    await contentList.startContent(0);

    await contentList.openMoreMenu(0);
    await expect(contentList.startNewRoundMenuItem()).toBeDisabled();
    await expect(contentList.deleteAnswersMenuItem()).toBeDisabled();
    await page.keyboard.press('Escape');

    await contentList.stopContent(0);

    await contentList.openMoreMenu(0);
    await expect(contentList.startNewRoundMenuItem()).toBeEnabled();
    await expect(contentList.deleteAnswersMenuItem()).toBeEnabled();
  });

  test('restarting a content with existing answers keeps the same round', async ({
    page,
    baseURL,
  }) => {
    await contentList.toggleLiveMode();
    await contentList.startContent(0);

    const participant = await page.context().newPage();
    await participant.goto(
      `${baseURL}/p/${shortId}/questionnaire/${questionnaireId}`
    );
    await participant.getByRole('radio').first().check();
    await participant.getByRole('button', { name: 'Submit' }).click();
    await expect(participant.getByText('You have answered.')).toBeVisible();
    await participant.close();

    await contentList.stopContent(0);
    await expect(contentList.finishedBadge(0)).toBeVisible();
    await expect(contentResults.roundSelectorButton()).toBeHidden();

    await contentList.startContent(0);

    await expect(contentList.stopButton(0)).toBeVisible();
    await expect(contentResults.roundSelectorButton()).toBeHidden();
  });
});
