import { test, expect } from '@playwright/test';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { GroupType, PublishingMode } from '@app/core/models/content-group';
import { AnswerResultType } from '@app/core/models/answer-result';
import { MockApi } from '@e2e/api/mock-api';

test.describe('participant answer survey', () => {
  let mockApi: MockApi;
  test.beforeEach(async ({ page }) => {
    mockApi = new MockApi(page);
    mockApi.mockMembershipParticipant();
    mockApi.mockRoomSummaryParticipant();
    mockApi.mockRequestMembership();
    mockApi.mockRoomWithShortId();
    mockApi.mockRoomSettings();
    mockApi.mockContentGroup(
      'My survey',
      ['content1', 'content2'],
      GroupType.SURVEY,
      true,
      true,
      true,
      PublishingMode.ALL,
      0,
      false
    );
    mockApi.mockFocusEvent();
    mockApi.mockRoomStats('My survey', 2, GroupType.SURVEY);
    mockApi.mockGroupStats(0, 0, 0, 0, [
      {
        contentId: 'content1',
        achievedPoints: 0,
        maxPoints: 500,
        state: AnswerResultType.UNANSWERED,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 500,
        state: AnswerResultType.UNANSWERED,
        duration: 0,
      },
    ]);
    mockApi.mockAttributions();
    mockApi.mockContentsSurvey();
    mockApi.mockRoomAnswers();
    mockApi.mockAnswers();
    mockApi.mockContentAnswering();
  });

  test('answer likert content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await participant.answerContent(['Somewhat agree']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
  });

  test('abstain on likert content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await participant.answerContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
  });

  test('answer text content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey', 2);
    await participant.answerTextContent('xyz');
    await expect(participant.getHintAfterAnswering()).toBeVisible();
  });

  test('abstain on text content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey', 2);
    await participant.answerTextContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
  });

  test('answer contents and show overview', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await expect(page.getByText('My likert content')).toBeVisible();
    await participant.answerContent(['Somewhat agree']);
    mockApi.mockGroupStats(0, 0, 0, 0, [
      {
        contentId: 'content1',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.NEUTRAL,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.NEUTRAL,
        duration: 0,
      },
    ]);
    await participant.answerTextContent('xyz');
    await expect(page.getByText('you are in 1st place')).toBeHidden();
    await expect(page.getByText('thanks for your participation')).toBeVisible();
    await expect(page.getByText('points')).toBeHidden();
    await expect(page.getByText('correct')).toBeHidden();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByText('my likert content')).toBeVisible();
    await expect(page.getByText('my open question content')).toBeVisible();
  });
});
