import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { PresentationModePage } from '@e2e/fixtures/creator/presentation-mode';
import { ParticipantCommentsPage } from '@e2e/fixtures/participant/comments';
import { CreatorCommentsPage } from '@e2e/fixtures/creator/comments';

test.describe('Q&A presentation', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let presentationModePage: PresentationModePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    presentationModePage = new PresentationModePage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
  });

  test.afterEach(async () => {
    await roomSettings.deleteRoomById(shortId);
  });

  test('should show correct initial state comment presentation', async ({
    page,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await page.waitForURL(/comments/);
    await expect(page.getByText('Q&A section is not enabled')).toBeVisible();
    await presentationModePage.startComments();
    await expect(page.getByText('no posts present')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should pause Q&A and start it again in presentation mode', async ({
    page,
    baseURL,
  }) => {
    const commentsPage = new CreatorCommentsPage(page, baseURL);
    await commentsPage.goto(shortId);
    await commentsPage.toggleReadonly();
    await expect(page.getByText('Q&A section is not enabled')).toBeHidden();
    await commentsPage.toggleReadonly();
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await expect(
      page.getByText('creation of posts is currently not allowed')
    ).toBeVisible();
    await presentationModePage.startComments();
    await expect(
      page.getByText('creation of posts is currently not allowed')
    ).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should show incoming comments', async ({ page, baseURL, browser }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await presentationModePage.startComments();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('Hello!');
    await expect(presentationModePage.getPost('Hello!')).toBeVisible();
    await participant.createPost('This is a test.');
    await expect(presentationModePage.getPost('This is a test.')).toBeVisible();
    await participant.createPost('Is this the third post?');
    await expect(
      presentationModePage.getPost('Is this the third post?')
    ).toBeVisible();
    await context.close();
    await presentationModePage.exitPresentation();
  });

  test('should filter posts by favorite and then by correct', async ({
    page,
    baseURL,
    browser,
  }) => {
    const commentsPage = new CreatorCommentsPage(page, baseURL);
    await commentsPage.goto(shortId);
    await commentsPage.startComments();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('Hello!');
    await participant.createPost('This is a favorite post.');
    await participant.createPost('This is a correct post.');
    await context.close();
    await commentsPage.openMoreMenuForPost('This is a favorite post.');
    await commentsPage.performMoreMenuAction('favorite');
    await commentsPage.openMoreMenuForPost('This is a correct post.');
    await commentsPage.performMoreMenuAction('correct');
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await expect(presentationModePage.getPost('Hello!')).toBeVisible();
    await expect(
      presentationModePage.getPost('This is a favorite post.')
    ).toBeVisible();
    await expect(
      presentationModePage.getPost('This is a correct post.')
    ).toBeVisible();
    await presentationModePage.filterComments('favorite');
    await expect(presentationModePage.getPost('Hello!')).toBeHidden();
    await expect(
      presentationModePage.getPost('This is a favorite post.')
    ).toBeVisible();
    await expect(
      presentationModePage.getPost('This is a correct post.')
    ).toBeHidden();
    // Filters combine, and selecting an active one clears it, so favorite has to be turned off
    // before switching to correct. Leaving both on would match no post at all.
    await presentationModePage.filterComments('favorite');
    await presentationModePage.filterComments('correct');
    await expect(presentationModePage.getPost('Hello!')).toBeHidden();
    await expect(
      presentationModePage.getPost('This is a favorite post.')
    ).toBeHidden();
    await expect(
      presentationModePage.getPost('This is a correct post.')
    ).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should sort posts correctly by time by default', async ({
    page,
    baseURL,
    browser,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await presentationModePage.startComments();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('This is my first post.');
    await expect(
      presentationModePage.getComment(0),
      'First and only post is displayed'
    ).toContainText('This is my first post.');
    await participant.createPost('This is another post.');
    await context.close();
    await expect(
      presentationModePage.getComment(0),
      'Second post is displayed first'
    ).toContainText('This is another post.');
    await expect(
      presentationModePage.getComment(1),
      'First post is displayed as second'
    ).toContainText('This is my first post.');
    await presentationModePage.exitPresentation();
  });

  test('should sort posts correctly by votes', async ({
    page,
    baseURL,
    browser,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await presentationModePage.startComments();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('This is my first post.');
    await participant.createPost('This is another post.');
    await participant.voteUpPost('This is my first post.');
    await participant.createPost('This is a third post.');
    await presentationModePage.sortComments('popular');
    await expect(
      presentationModePage.getComment(0),
      'Highest rating is shown first'
    ).toContainText('This is my first post.');
    await expect(
      presentationModePage.getComment(1),
      'Latest comment with zero votes should be displayed in the middle'
    ).toContainText('This is a third post.');
    await expect(
      presentationModePage.getComment(2),
      'Oldest comment with zero votes should be displayed at the end'
    ).toContainText('This is another post.');
    await participant.voteDownPost('This is a third post.');
    await context.close();
    // A score arriving live updates the post in place. The list deliberately keeps the order it
    // was queried with instead of re-sorting, so rows do not jump while an audience reads them.
    await expect(
      presentationModePage.getPost('This is a third post.'),
      'Score of the downvoted post updates live'
    ).toContainText('-1');
    await expect(
      presentationModePage.getComment(1),
      'Position of the downvoted post is unchanged'
    ).toContainText('This is a third post.');
    await presentationModePage.exitPresentation();
  });
});
