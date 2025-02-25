import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { CommentsPage as CreatorCommentsPage } from '@e2e/fixtures/creator/comments';
import { CommentsPage as ParticipantCommentsPage } from '@e2e/fixtures/participant/comments';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('Q&A', () => {
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

  test('should create a first post', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await expect(
      page.getByText('This is my first post.').first()
    ).toBeVisible();
    await expect(page.getByText('Public (1)')).toBeVisible();
  });

  test('should disable creation of new posts if readonly mode enabled', async ({
    page,
    baseURL,
  }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participantCommentPage = new ParticipantCommentsPage(p, baseURL);
    await participantCommentPage.goto(shortId);
    await commentsPage.goto(shortId);
    await commentsPage.toggleReadonly();
    await expect(
      page.getByText('creation of posts is currently not allowed')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'unlock creation' })
    ).toBeVisible();
    await expect(
      p.getByText('creation of posts is currently not allowed')
    ).toBeVisible();
    await expect(
      p.getByRole('button', { name: 'write a post' }).first()
    ).toBeDisabled();
    await expect(
      p.getByRole('button', { name: 'write a post' }).nth(1)
    ).toBeDisabled();
    await context.close();
  });

  test('should display incoming posts by participant', async ({
    page,
    baseURL,
  }) => {
    await commentsPage.goto(shortId);
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participantCommentPage = new ParticipantCommentsPage(p, baseURL);
    await participantCommentPage.goto(shortId);
    await participantCommentPage.createPost('Hello there!');
    await participantCommentPage.createPost('This is my second post.');
    await expect(page.getByText('Hello there!').first()).toBeVisible();
    await expect(
      page.getByText('This is my second post.').first()
    ).toBeVisible();
    await expect(page.getByText('Public (2)')).toBeVisible();
    await context.close();
  });

  test('should open more menu with actions for comment', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await expect(
      page.getByRole('menuitem', {
        name: 'reply',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', {
        name: 'mark as correct',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', {
        name: 'mark as wrong',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', {
        name: 'mark as favorite',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', {
        name: 'delete',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', {
        name: 'ban from public list',
      })
    ).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('should answer comment', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'reply',
      })
      .click();
    await page.getByPlaceholder('enter your answer').fill('This is my answer.');
    await page.getByRole('button', { name: 'save' }).click();
    await page.getByRole('button', { name: 'close' }).click();
    await expect(page.getByTestId('comment-answer-button')).toBeVisible();
  });

  test('should mark comment as correct', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'mark as correct',
      })
      .click();
    await expect(page.getByTestId('comment-correct-button')).toBeVisible();
  });

  test('should mark comment as wrong', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'mark as wrong',
      })
      .click();
    await expect(page.getByTestId('comment-wrong-button')).toBeVisible();
  });

  test('should mark comment as favorite', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'mark as favorite',
      })
      .click();
    await expect(page.getByTestId('comment-favorite-button')).toBeVisible();
  });

  test('should delete comment', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'delete',
      })
      .click();
    await page.getByRole('button', { name: 'delete' }).click();
    await expect(commentsPage.getNoCommentsHint()).toBeVisible();
  });

  test('should ban comment from public list', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'ban',
      })
      .click();
    await expect(commentsPage.getNoCommentsHint()).toBeVisible();
    await expect(page.getByText('Public (1)')).toBeHidden();
    await expect(page.getByText('Moderation (1)')).toBeVisible();
  });

  test('should have recent order by default', async () => {
    await commentsPage.goto(shortId);
    expect(
      await commentsPage.getSortSelect(),
      'Sorting is set to recent'
    ).toContain('sort Recent');
  });

  test('should create multiple Q&A posts which are displayed in recent order', async () => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await expect(
      commentsPage.getComment(0),
      'Comment has correct body'
    ).toContainText('This is my first post.');
    await commentsPage.createPost('This is another post.');
    await expect(
      commentsPage.getComment(0),
      'New comment is shown first'
    ).toContainText('This is another post.');
    await expect(
      commentsPage.getComment(1),
      'Old comment is shown as second'
    ).toContainText('This is my first post.');
  });

  test('should create multiple Q&A posts which are displayed with descending rating order', async ({
    page,
    baseURL,
  }) => {
    const participantCommentPage = new ParticipantCommentsPage(page, baseURL);
    await participantCommentPage.goto(shortId);
    await participantCommentPage.setSorting(1);
    await participantCommentPage.createPost('This is my first post.');
    await participantCommentPage.createPost('This is another post.');
    await participantCommentPage.voteUp(1);
    await participantCommentPage.createPost('This is a third post.');
    await expect(
      participantCommentPage.getComment(0),
      'Highest rating is shown first'
    ).toContainText('This is another post.');
    await expect(
      participantCommentPage.getComment(1),
      'Oldest comment with zero votes should be displayed in the middle'
    ).toContainText('This is my first post.');
    await expect(
      participantCommentPage.getComment(2),
      'Newest comment with zero votes should be displayed at the end'
    ).toContainText('This is a third post.');
    await participantCommentPage.voteDown(1);
    await expect(
      participantCommentPage.getComment(2),
      'Lowest rating should be displayed at the end'
    ).toContainText('This is my first post.');
    await expect(
      participantCommentPage.getComment(1),
      'Neutral rating should be displayed in the middle'
    ).toContainText('This is a third post.');
    await header.switchRole();
  });

  test('should filter favorite comments', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is my favorite post.');
    await commentsPage.createPost('This is a third post.');
    await commentsPage.createPost('This is another favorite post.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'mark as favorite',
      })
      .click();
    await commentsPage.openMoreMenu(2);
    await page
      .getByRole('menuitem', {
        name: 'mark as favorite',
      })
      .click();
    await commentsPage.filterComments('favorite');
    await expect(
      page.getByText('This is my first post.', { exact: true })
    ).toBeHidden();
    await expect(
      page.getByText('This is a third post.', { exact: true })
    ).toBeHidden();
    await expect(
      page.getByText('This is my favorite post.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('This is another favorite post.', { exact: true })
    ).toBeVisible();
  });

  test('should search comments', async ({ page }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is my second post.');
    await commentsPage.createPost('This is a third post.');
    await commentsPage.createPost('This is another post.');
    await commentsPage.searchComments('this is a');
    await expect(
      page.getByText('This is my first post.', { exact: true })
    ).toBeHidden();
    await expect(
      page.getByText('This is my second post.', { exact: true })
    ).toBeHidden();
    await expect(
      page.getByText('This is a third post.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('This is another post.', { exact: true })
    ).toBeVisible();
  });

  test('should show correct content count in search bar placeholder', async () => {
    await commentsPage.goto(shortId);
    expect(
      await commentsPage.getSearchPlaceholder(),
      'Placeholder shows no posts'
    ).toContain('No posts');
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is another post.');
    await commentsPage.createPost('This is a third post.');
    expect(
      await commentsPage.getSearchPlaceholder(),
      'Search placeholder counts 3 posts'
    ).toContain('3 posts');
  });

  test('should show additional create button until 3 posts are created', async ({
    page,
    baseURL,
  }) => {
    const participantCommentPage = new ParticipantCommentsPage(page, baseURL);
    await participantCommentPage.goto(shortId);
    await participantCommentPage.createPost('This is my first post.');
    await participantCommentPage.createPost('This is another post.');
    expect(
      participantCommentPage.getSecondaryCreateButton(),
      'Additional create button is visible'
    ).toBeVisible();
    await participantCommentPage.createPost('This is a third post.');
    expect(
      participantCommentPage.getSecondaryCreateButton(),
      'Additional create button is hidden after third post'
    ).toBeHidden();
    await header.switchRole();
  });

  test('should ban comments and go to moderation and release them again', async ({
    page,
  }) => {
    await commentsPage.goto(shortId);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is my second post.');
    await commentsPage.createPost('This is a comment to be banned.');
    await commentsPage.openMoreMenu(0);
    await page
      .getByRole('menuitem', {
        name: 'ban',
      })
      .click();
    await expect(page.getByText('Public (2)')).toBeVisible();
    await commentsPage.switchToModeration();
    await expect(
      page.getByText('This is a comment to be banned.', { exact: true })
    ).toBeVisible();
    await commentsPage.releaseComment(0);
    await expect(commentsPage.getNoCommentsHint()).toBeVisible();
    await expect(page.getByText('Moderation (1)')).toBeHidden();
    await expect(page.getByText('Public (3)')).toBeVisible();
  });
});
