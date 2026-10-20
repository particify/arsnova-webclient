import { BrowserContext, Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';
import { ContentGroupPage as ParticipantContentGroupPage } from '@e2e/fixtures/participant/content-group';

test.describe('flashcards and slides', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let participantContext: BrowserContext | undefined;

  test.beforeEach(async ({ page, baseURL }) => {
    creatorPage = page;
    roomSettings = new RoomSettingsPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My series',
      'Mixed'
    );
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createFlashcardContent(
      'My flashcard front',
      'My flashcard back'
    );
    await contentCreation.createSlideContent('My slide content');
    const contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    await contentGroupOverview.configure({ liveMode: false });
    await contentGroupOverview.publishContentGroup();
  });

  test.afterEach(async () => {
    await participantContext?.close();
    participantContext = undefined;
    await roomSettings.deleteRoomById(shortId);
  });

  test('participants reveal the back of a flashcard and go on to the slide', async ({
    browser,
    baseURL,
  }) => {
    participantContext = await browser.newContext();
    const page = await participantContext.newPage();
    await new ParticipantContentGroupPage(page, baseURL).goto(
      shortId,
      'My series'
    );
    // A series without questions opens with its list of contents.
    await expect(
      page.getByText('Jump to any content or return to the room overview.')
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'My flashcard front' })
      .first()
      .click();
    await expect(page.getByText('My flashcard back')).toBeHidden();
    await page.getByRole('button', { name: 'Show answer' }).click();
    await expect(page.getByText('My flashcard back')).toBeVisible();
    await page.locator('.step-btn').nth(1).click();
    await expect(page.getByText('My slide content')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeHidden();
  });

  test('the creator sees both sides of a flashcard', async () => {
    await creatorPage
      .getByRole('button', { name: /My flashcard front/ })
      .click();
    await expect(creatorPage.getByText('My flashcard back')).toBeVisible();
  });
});
