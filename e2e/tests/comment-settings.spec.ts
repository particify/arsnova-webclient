import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { CreatorCommentsPage } from '@e2e/fixtures/creator/comments';
import { ParticipantCommentsPage } from '@e2e/fixtures/participant/comments';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('Q&A settings', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let commentsPage: CreatorCommentsPage;

  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    // Shared fixtures
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    commentsPage = new CreatorCommentsPage(page, baseURL);
    // Go to home
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    // Create room
    shortId = await homePage.createRoom('My room');
  });

  test.afterEach(async () => {
    // Delete room
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should enable Q&A', async ({ baseURL }) => {
    await roomSettings.goto(shortId);
    await roomSettings.goToCommentSettings();
    await roomSettings.toggleCommentsEnabled();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participantCommentPage = new ParticipantCommentsPage(p, baseURL);
    await participantCommentPage.goto(shortId);
    await expect(p.getByText('The Q&A section is not enabled.')).toBeVisible();
    await commentsPage.goto(shortId);
    await commentsPage.enableComments();
    await expect(p.getByText('The Q&A section is not enabled.')).toBeHidden();
    await context.close();
  });

  test('should go to comment settings', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.openCommentsMoreMenu();
    await page.getByRole('menuitem', { name: 'settings' }).click();
    await expect(page).toHaveURL(/settings\/comments/);
  });

  test('should export comments', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is my second post.');
    const downloadPromise = page.waitForEvent('download');
    await commentsPage.openCommentsMoreMenu();
    await page.getByRole('menuitem', { name: 'export' }).click();
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('should delete all comments', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is my second post.');
    await commentsPage.openCommentsMoreMenu();
    await page.getByRole('menuitem', { name: 'delete all' }).click();
    await page.getByRole('button', { name: 'delete' }).click();
    await expect(page.getByText('Public (2)')).toBeHidden();
    await expect(commentsPage.getNoCommentsHint()).toBeVisible();
  });

  test('should add incoming posts to moderation if direct send setting is set to false', async ({
    page,
    baseURL,
  }) => {
    await roomSettings.goto(shortId);
    await roomSettings.goToCommentSettings();
    await roomSettings.toggleDirectSend();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participantCommentPage = new ParticipantCommentsPage(p, baseURL);
    await participantCommentPage.goto(shortId);
    await commentsPage.goto(shortId);
    await participantCommentPage.createPost('Hello to the moderation');
    await expect(
      p.getByText('post will be reviewed by a moderator')
    ).toBeVisible();
    await expect(page.getByText('Moderation (1)')).toBeVisible();
    await commentsPage.switchToModeration();
    await expect(
      page.getByText('Hello to the moderation', { exact: true })
    ).toBeVisible();
    await participantCommentPage.createPost('Hello again');
    await expect(page.getByText('Hello again', { exact: true })).toBeVisible();
    await context.close();
  });
});
