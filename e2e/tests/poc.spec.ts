import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomOverviewPage as ParticipantRoomOverviewPage } from '@e2e/fixtures/participant/room-overview';
import { CommentsPage } from '@e2e/fixtures/participant/comments';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';

test.describe('Q&A tests', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let commentsPage: CommentsPage;

  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    // Shared fixtures
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    commentsPage = new CommentsPage(page, baseURL);
    // Go to home
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    // Create room
    shortId = await homePage.createRoom('My room');
    // Join room as participant
    await homePage.goto();
    await homePage.joinRoom(shortId);
    // Go to Q&A
    const roomOverviewPage = new ParticipantRoomOverviewPage(page, baseURL);
    await roomOverviewPage.goToComments();
  });

  test.afterEach(async () => {
    // Delete room
    await header.switchRole();
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should join room, navigate to Q&A and create a post', async () => {
    await commentsPage.createPost('This is my first post.');
    expect(
      await commentsPage.getComment(0),
      'Created comment exists'
    ).toContainText('This is my first post.');
  });

  test('should have recent order by default', async () => {
    expect(
      await commentsPage.getSortSelect(),
      'Sorting is set to recent'
    ).toContain('sort Recent');
  });

  test('should create multiple Q&A posts which are displayed in recent order', async () => {
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

  test('should create multiple Q&A posts which are displayed with descending rating order', async () => {
    await commentsPage.setSorting(1);
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is another post.');
    await commentsPage.voteUp(1);
    await commentsPage.createPost('This is a third post.');
    await expect(
      commentsPage.getComment(0),
      'Highest rating is shown first'
    ).toContainText('This is another post.');
    await expect(
      commentsPage.getComment(1),
      'Oldest comment with zero votes should be displayed in the middle'
    ).toContainText('This is my first post.');
    await expect(
      commentsPage.getComment(2),
      'Newest comment with zero votes should be displayed at the end'
    ).toContainText('This is a third post.');
    await commentsPage.voteDown(1);
    await expect(
      commentsPage.getComment(2),
      'Lowest rating should be displayed at the end'
    ).toContainText('This is my first post.');
    await expect(
      commentsPage.getComment(1),
      'Neutral rating should be displayed in the middle'
    ).toContainText('This is a third post.');
  });

  test('should show correct content count in search bar placeholder', async () => {
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

  test('should show additional create button until 3 posts are created', async () => {
    await commentsPage.createPost('This is my first post.');
    await commentsPage.createPost('This is another post.');
    expect(
      commentsPage.getSecondaryCreateButton(),
      'Additional create button is visible'
    ).toBeVisible();
    await commentsPage.createPost('This is a third post.');
    expect(
      commentsPage.getSecondaryCreateButton(),
      'Additional create button is hidden after third post'
    ).toBeHidden();
  });
});
