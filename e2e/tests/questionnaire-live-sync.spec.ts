import { test, expect } from '@playwright/test';
import { QuestionnairePage } from '@e2e/fixtures/participant/questionnaire-page';
import {
  MockGraphqlApi,
  MOCK_QUESTIONNAIRE_ID,
} from '@e2e/api/mock-graphql-api';
import { MockApi } from '@e2e/api/mock-api';
import { GroupType } from '@app/core/models/content-group';

const TEST_ROOM_ID = '3f9cecb56dbf45ccb6304af700d474b6';
const SHORT_ID = '12345678';

test.describe('participant questionnaire live sync', () => {
  let mockApi: MockApi;
  let mockGraphqlApi: MockGraphqlApi;

  test.beforeEach(async ({ page }) => {
    mockApi = new MockApi(page);
    mockApi.mockRoomStats(TEST_ROOM_ID, 'My questionnaire', 3, GroupType.MIXED);
    mockGraphqlApi = new MockGraphqlApi(page);
  });

  test('starting a content replaces the waiting area with the answer form', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      contentCount: 3,
      publishedUpToPosition: 0,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getWaitingHint(1, 3)).toBeVisible();
    await expect(participant.getSubmitButton()).toBeHidden();
    await expect(participant.getStepButtons()).toHaveCount(3);
    await expect(participant.getStepButton(1)).toHaveClass(/primary-border/);

    await mockGraphqlApi.update({ activeContentPosition: 0 });

    await expect(participant.getWaitingHint(1, 3)).toBeHidden();
    await expect(participant.getSubmitButton()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeEnabled();
    await expect(participant.getStepButtons()).toHaveCount(3);
    await expect(participant.getStepButton(1)).toHaveClass(/primary-border/);
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-1`
    );
  });

  test('stopping a content locks answering', async ({ page, baseURL }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      contentCount: 2,
      publishedUpToPosition: 0,
      activeContentPosition: 0,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getSubmitButton()).toBeVisible();

    await mockGraphqlApi.update({ activeRoundClosed: true });

    await expect(participant.getSubmitButton()).toBeHidden();
    await expect(
      participant.getHintAfterContentStoppedWithoutAnswering()
    ).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeDisabled();
  });

  test('restarting the same round keeps existing answers, a new round clears them', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      contentCount: 2,
      publishedUpToPosition: 0,
      activeContentPosition: 0,
      answeredPositions: [0],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getHintAfterAnswering()).toBeVisible();

    await mockGraphqlApi.update({ activeRoundClosed: true });
    await expect(participant.getSubmitButton()).toBeHidden();

    await mockGraphqlApi.update({ activeRoundClosed: false });
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeDisabled();

    await mockGraphqlApi.update({
      roundCounts: { 0: 2 },
      answeredPositions: [],
    });
    await expect(participant.getHintAfterAnswering()).toBeHidden();
    await expect(participant.getSubmitButton()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeEnabled();
  });

  test('starting the next content moves the participant along', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      contentCount: 2,
      publishedUpToPosition: 0,
      activeContentPosition: 0,
      answeredPositions: [0],
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getStepButton(1)).toHaveClass(/primary-border/);
    await expect(participant.getStepButton(2)).toBeDisabled();
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-1`
    );

    await mockGraphqlApi.update({
      publishedUpToPosition: 1,
      activeContentPosition: 1,
    });

    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(participant.getSubmitButton()).toBeVisible();
    await expect(participant.getFirstRadioButton()).toBeEnabled();
    await expect(participant.getStepButton(2)).toHaveClass(/primary-border/);
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-2`
    );
  });

  test('releasing a content without starting it moves the participant along', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'LIVE',
      contentCount: 2,
      publishedUpToPosition: 0,
      activeContentPosition: 0,
      activeRoundClosed: true,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();
    await expect(participant.getStepButton(1)).toHaveClass(/primary-border/);

    await mockGraphqlApi.update({ publishedUpToPosition: 1 });

    await expect(participant.getWaitingHint(2, 2)).toBeVisible();
    await expect(participant.getStepButton(2)).toHaveClass(/primary-border/);
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-2`
    );
  });

  test('range mode offers to go to a released content instead of navigating', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'UP_TO',
      contentCount: 3,
      publishedUpToPosition: 0,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();

    await mockGraphqlApi.update({ publishedUpToPosition: 1 });

    await expect(participant.getContentListUpdatedHint()).toBeVisible();
    await expect(participant.getContentBody('Content 1')).toBeVisible();
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-1`
    );

    await participant.getContentListUpdatedAction().click();

    await expect(participant.getContentBody('Content 2')).toBeVisible();
    await expect(participant.getStepButton(2)).toHaveClass(/primary-border/);
    await expect(page).toHaveURL(
      `${baseURL}/p/${SHORT_ID}/questionnaire/${MOCK_QUESTIONNAIRE_ID}/content-2`
    );
  });

  test('range mode adds the released content to the stepper', async ({
    page,
    baseURL,
  }) => {
    await mockGraphqlApi.mockQuestionnaire({
      publishingMode: 'UP_TO',
      contentCount: 3,
      publishedUpToPosition: 0,
    });
    const participant = new QuestionnairePage(page, baseURL);
    await participant.goto(SHORT_ID, MOCK_QUESTIONNAIRE_ID);
    await expect(participant.getContentBody('Content 1')).toBeVisible();

    await mockGraphqlApi.update({ publishedUpToPosition: 1 });
    await expect(participant.getContentListUpdatedHint()).toBeVisible();

    await participant.goToStep(2);
    await expect(participant.getContentBody('Content 2')).toBeVisible();
  });
});
