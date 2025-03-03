import { test, expect } from '@playwright/test';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { GroupType } from '@app/core/models/content-group';
import { AnswerResultType } from '@app/core/models/answer-result';
import { MockApi } from '@e2e/api/mock-api';

test.describe('participant answer async quiz', () => {
  let mockApi: MockApi;
  test.beforeEach(async ({ page }) => {
    mockApi = new MockApi(page);
    mockApi.mockMembershipParticipant();
    mockApi.mockRoomSummaryParticipant();
    mockApi.mockRequestMembership();
    mockApi.mockRoomWithShortId();
    mockApi.mockRoomSettings();
    mockApi.mockContentGroup(
      'My quiz',
      ['content1', 'content2'],
      GroupType.QUIZ
    );
    mockApi.mockFocusEvent();
    mockApi.mockRoomStats('My quiz', 2, GroupType.QUIZ);
    mockApi.mockAliasGeneration('Funny fish');
    mockApi.mockUserAlias();
    mockApi.mockGroupStats(0, 2, 0, 1000, [
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
    mockApi.mockContentsQuiz();
    mockApi.mockRoomAnswers();
    mockApi.mockContentAnswering();
    mockApi.mockCheckResult();
    mockApi.mockCorrectChoiceIndexes();
    mockApi.mockGroupLeaderboard(0, 'Funny fish');
  });

  test('answer MC content correctly', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await participant.answerContent(['b']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeVisible();
  });

  test('answer MC content wrong', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await participant.answerContent(['c']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeVisible();
  });

  test('abstain on MC content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await participant.answerContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeHidden();
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });

  test('answer short answer content correctly', async ({ page, baseURL }) => {
    mockApi.mockShortAnswerContentStats('content2', ['abc'], [1], 1);
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz', 2);
    await participant.joinQuiz();
    await participant.answerTextContent('abc');
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await participant.switchToResultsTab();
    await expect(page.getByText('100 %', { exact: true })).toBeVisible();
    await expect(page.getByText('abc')).toBeVisible();
    await expect(page.getByTestId('correct-indicator-icon')).toBeVisible();
  });

  test('answer short answer content wrong', async ({ page, baseURL }) => {
    mockApi.mockShortAnswerContentStats('content2', ['xyz'], [1], 1);
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz', 2);
    await participant.joinQuiz();
    await participant.answerTextContent('xyz');
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await participant.switchToResultsTab();
    await expect(page.getByText('0 %', { exact: true })).toBeVisible();
    await expect(page.getByText('xyz')).toBeVisible();
  });

  test('abstain on short answer content', async ({ page, baseURL }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz', 2);
    await participant.joinQuiz();
    await participant.answerTextContent();
    await expect(participant.getHintAfterAbstaining()).toBeVisible();
  });

  test('answer MC content correctly but correct options are not published', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockContentGroup(
      'My quiz',
      ['content1', 'content2'],
      GroupType.QUIZ,
      true,
      false
    );
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await participant.answerContent(['b']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('correct')).toBeHidden();
  });

  test('answer MC content wrong but correct options are not published', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockContentGroup(
      'My quiz',
      ['content1', 'content2'],
      GroupType.QUIZ,
      true,
      false
    );
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await participant.answerContent(['c']);
    await expect(participant.getHintAfterAnswering()).toBeVisible();
    await expect(participant.getCorrectStateIcon('wrong')).toBeHidden();
  });
});
