import { test, expect } from '@playwright/test';
import { QuestionnairePage } from '@e2e/fixtures/participant/questionnaire-page';
import {
  MockGraphqlApi,
  MOCK_QUESTIONNAIRE_ID,
  contentId,
} from '@e2e/api/mock-graphql-api';
import { MockApi } from '@e2e/api/mock-api';
import { GroupType } from '@app/core/models/content-group';

const TEST_ROOM_ID = '3f9cecb56dbf45ccb6304af700d474b6';
const SHORT_ID = '12345678';

test.describe('participant questionnaire entry', () => {
  let mockApi: MockApi;
  let mockGraphqlApi: MockGraphqlApi;

  test.beforeEach(async ({ page }) => {
    mockApi = new MockApi(page);
    mockApi.mockRoomStats(TEST_ROOM_ID, 'My questionnaire', 3, GroupType.MIXED);
    mockGraphqlApi = new MockGraphqlApi(page);
  });

  test('ALL mode without answers enters at the first content', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({ publishingMode: 'ALL' });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();
    await expect(participant.getSubmitButton()).toBeVisible();
  });

  test('ALL mode with the first content answered enters at the first unanswered content', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'ALL',
      answeredPositions: [0],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
  });

  test('ALL mode with everything answered shows the overview', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'ALL',
      answeredPositions: [0, 1, 2],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(page.getByText('thanks for your participation')).toBeVisible();
  });

  test('deep link enters at the linked content', async ({ page, baseURL }) => {
    await mockGraphqlApi.mockQuestionnaire({ publishingMode: 'ALL' });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID, contentId(1));
    await expect(participant.getContentBody('Content 2')).toBeVisible();
  });

  test('UP_TO mode only shows the published range', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'UP_TO',
      publishedUpToPosition: 1,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();
  });

  test('UP_TO mode with the first content answered enters at the second one', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'UP_TO',
      publishedUpToPosition: 1,
      answeredPositions: [0],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
  });

  test('LIVE mode without a started content shows the no-contents hint', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({ publishingMode: 'LIVE' });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getNoContentsHint()).toBeVisible();
  });

  test('LIVE mode with a released but unstarted content shows the waiting area', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 0,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getWaitingHint(1, 3)).toBeVisible();
    await expect(participant.getContentBody('Content 1')).toBeHidden();
    await expect(participant.getSubmitButton()).toBeHidden();
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/${contentId(0)}`
    );
  });

  test('LIVE mode enters at the started content', async ({ page, baseURL }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(participant.getSubmitButton()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeEnabled();
  });

  test('LIVE mode enters at the started content even if the first one was answered', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
      answeredPositions: [0],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(participant.getSubmitButton()).toBeVisible();
  });

  test('LIVE mode keeps the content of the URL once the started one is answered', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
      answeredPositions: [1],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID, contentId(0));
    await expect(participant.getContentBody('Content 1')).toBeVisible();
  });

  test('LIVE mode enters at the released content when no round is running', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
      activeRoundClosed: true,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID, contentId(0));
    await expect(participant.getContentBody('Content 1')).toBeVisible();
  });

  test('LIVE mode with the started content already answered shows the answered state', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
      answeredPositions: [1],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeDisabled();
  });

  test('LIVE mode with a stopped round locks answering', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      publishedUpToPosition: 1,
      activeContentPosition: 1,
      activeRoundClosed: true,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(
      participant.getHintAfterContentStoppedWithoutAnswering()
    ).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeDisabled();
  });

  test('answering updates the view state', async ({ page, baseURL }) => {
    await mockGraphqlApi.mockQuestionnaire({ publishingMode: 'ALL' });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await participant.answerContent(['Option A']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getSubmitButton()).toBeHidden();
    await expect(participant.getFirstRadioButton()).toBeDisabled();
  });
});
