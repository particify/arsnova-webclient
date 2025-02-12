import { test, expect } from '@playwright/test';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';
import { GroupType, PublishingMode } from '@app/core/models/content-group';
import { AnswerResultType } from '@app/core/models/answer-result';
import { MockApi } from '@e2e/api/mock-api';
import { Header } from '@e2e/fixtures/shared/header';

test.describe('participant choice answer option translation', () => {
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
      ['content1', 'content2', 'content3'],
      GroupType.SURVEY,
      true,
      true,
      true,
      PublishingMode.ALL,
      0,
      false
    );
    mockApi.mockFocusEvent();
    mockApi.mockRoomStats('My survey', 3, GroupType.SURVEY);
    mockApi.mockGroupStats(0, 0, 0, 0, [
      {
        contentId: 'content1',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.UNANSWERED,
        duration: 0,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.UNANSWERED,
        duration: 0,
      },
      {
        contentId: 'content3',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.UNANSWERED,
        duration: 0,
      },
    ]);
    mockApi.mockAttributions();
    mockApi.mockContentsSurvey();
    mockApi.mockRoomAnswers();
    mockApi.mockAnswers();
  });

  test.use({
    locale: 'de',
  });

  test('answer likert content with german UI and change to english', async ({
    page,
    baseURL,
  }) => {
    const header = new Header(page);
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await expect(page.getByText('stimme eher zu')).toBeVisible();
    await header.openMainMenu();
    await header.changeLanguage('english');
    await page.reload();
    await expect(page.getByText('somewhat agree')).toBeVisible();
  });

  test('answer likert content german UI but english room lang', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockRoomWithShortId('en');
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await expect(page.getByText('somewhat agree')).toBeVisible();
  });

  test('answer likert content english UI but german room lang', async ({
    page,
    baseURL,
  }) => {
    const header = new Header(page);
    mockApi.mockRoomWithShortId('de');
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey');
    await header.openMainMenu();
    await header.changeLanguage('english');
    await page.reload();
    await expect(page.getByText('stimme eher zu')).toBeVisible();
  });

  test('answer choice content with room lang which should not have any effect', async ({
    page,
    baseURL,
  }) => {
    mockApi.mockRoomWithShortId('de');
    const participant = new ParticipantContentGroupPage(page, baseURL);
    await participant.goto('12345678', 'My survey', 3);
    await expect(page.getByText('answer 1')).toBeVisible();
  });
});
