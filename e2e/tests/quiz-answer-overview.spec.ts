import { test, expect } from '@playwright/test';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { GroupType, PublishingMode } from '@app/core/models/content-group';
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

  test('answer contents partly correct and show overview', async ({
    page,
    baseURL,
  }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await expect(page.getByText('My choice content')).toBeVisible();
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await participant.answerTextContent('xyz');
    mockApi.mockGroupStats(1, 2, 500, 1000, [
      {
        contentId: 'content1',
        achievedPoints: 500,
        maxPoints: 500,
        state: AnswerResultType.CORRECT,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 500,
        state: AnswerResultType.WRONG,
        duration: 0,
      },
    ]);
    mockApi.mockGroupLeaderboard(500, 'Funny fish');
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeVisible();
    await expect(page.getByText('500')).toBeVisible();
    await expect(page.getByText('50%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByText('my choice content')).toBeVisible();
    await expect(page.getByText('my short answer content')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeVisible();
    await expect(page.getByTestId('wrong-icon')).toBeVisible();
  });

  test('answer all contents wrong and show overview', async ({
    page,
    baseURL,
  }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await expect(page.getByText('My choice content')).toBeVisible();
    await participant.answerContent(['c']);
    await participant.goToNextContent();
    await participant.answerTextContent('xyz');
    mockApi.mockGroupStats(0, 2, 0, 1000, [
      {
        contentId: 'content1',
        achievedPoints: 0,
        maxPoints: 500,
        state: AnswerResultType.WRONG,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 500,
        state: AnswerResultType.WRONG,
        duration: 0,
      },
    ]);
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeVisible();
    await expect(page.getByText('0%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeHidden();
    await expect(page.getByTestId('wrong-icon').first()).toBeVisible();
  });

  test('answer all contents correct and show overview and leaderboard', async ({
    page,
    baseURL,
  }) => {
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.joinQuiz();
    await expect(page.getByText('My choice content')).toBeVisible();
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await participant.answerTextContent('abc');
    mockApi.mockGroupStats(2, 2, 1000, 1000, [
      {
        contentId: 'content1',
        achievedPoints: 500,
        maxPoints: 500,
        state: AnswerResultType.CORRECT,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 500,
        maxPoints: 500,
        state: AnswerResultType.CORRECT,
        duration: 0,
      },
    ]);
    mockApi.mockGroupLeaderboard(1000, 'Funny fish');
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon').first()).toBeVisible();
    await expect(page.getByTestId('wrong-icon')).toBeHidden();
    await expect(page.getByRole('tab', { name: 'contents' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'leaderboard' })).toBeVisible();
    await participant.switchToLeaderboardTab();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Funny fish')).toBeVisible();
  });

  test('answer all contents correct and show overview with disabled leaderboard', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockContentGroup(
      'My quiz',
      ['content1', 'content2'],
      GroupType.QUIZ,
      true,
      true,
      true,
      PublishingMode.ALL,
      0,
      false
    );
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await participant.answerTextContent('abc');
    mockApi.mockGroupStats(2, 2, 1000, 1000, [
      {
        contentId: 'content1',
        achievedPoints: 500,
        maxPoints: 500,
        state: AnswerResultType.CORRECT,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 500,
        maxPoints: 500,
        state: AnswerResultType.CORRECT,
        duration: 0,
      },
    ]);
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeHidden();
    await expect(page.getByText('1000')).toBeHidden();
    await expect(page.getByText('100%')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'contents' })).toBeHidden();
    await expect(page.getByRole('tab', { name: 'leaderboard' })).toBeHidden();
    await expect(page.getByText('my choice content')).toBeVisible();
    await expect(page.getByText('my short answer content')).toBeVisible();
    await page.getByText('my choice content').click();
    await expect(page).toHaveURL(/series\/My%20quiz\/1/);
  });

  test('answer all contents and show overview with correct options not published', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockContentGroup(
      'My quiz',
      ['content1', 'content2'],
      GroupType.QUIZ,
      true,
      false,
      true,
      PublishingMode.ALL,
      0,
      false
    );

    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My quiz');
    await participant.answerContent(['b']);
    await participant.goToNextContent();
    await participant.answerTextContent('abc');
    mockApi.mockGroupStats(2, 2, 1000, 1000, [
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
    mockApi.mockGroupLeaderboard(1000, 'Funny fish');
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeHidden();
    await expect(page.getByText('100%')).toBeHidden();
    await expect(page.getByText('correct')).toBeHidden();
    await expect(page.getByText('thanks for your participation')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeHidden();
    await expect(page.getByTestId('neutral-icon').first()).toBeVisible();
  });

  test('answer all contents and show overview with correct options not published but leaderboard enabled', async ({
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
    await participant.goToNextContent();
    await participant.answerTextContent('abc');
    mockApi.mockGroupStats(2, 2, 1000, 1000, [
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
    mockApi.mockGroupLeaderboard(1000, 'Funny fish');
    await participant.getGoToOverviewButton().click();
    await expect(page.getByText('you are in 1st place')).toBeVisible();
    await expect(page.getByText('thanks for your participation')).toBeHidden();
    await expect(page.getByText('100%')).toBeHidden();
    await expect(page.getByText('correct')).toBeHidden();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(page.getByTestId('correct-icon')).toBeHidden();
    await expect(page.getByTestId('neutral-icon').first()).toBeVisible();
  });
});
