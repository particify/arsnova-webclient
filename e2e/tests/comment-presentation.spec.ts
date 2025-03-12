import { test, expect, chromium } from '@playwright/test';
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
    await header.goToSettings();
    await roomSettings.deleteRoom();
  });

  test('should show correct initial state comment presentation', async ({
    page,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await expect(
      page.getByText(shortId.slice(0, 4) + ' ' + shortId.slice(4, 8))
    ).toBeVisible();
    await expect(page.getByText('no posts present')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should enable comments', async ({ page }) => {
    await header.goToSettings();
    await roomSettings.goToCommentSettings();
    await roomSettings.toggleCommentsEnabled();
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    await expect(page.getByText('Q&A section is not enabled')).toBeVisible();
    await presentationModePage.enableComments();
    await expect(page.getByText('Q&A section is not enabled')).toBeHidden();
    await expect(page.getByText('no posts present')).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should disable Q&A and enable it again in presentation mode', async ({
    page,
    baseURL,
  }) => {
    const commentsPage = new CreatorCommentsPage(page, baseURL);
    await commentsPage.goto(shortId);
    await commentsPage.toggleReadonly();
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await expect(
      page.getByText('creation of posts is currently not allowed')
    ).toBeVisible();
    await presentationModePage.disableCommentsReadOnlyMode();
    await expect(
      page.getByText('creation of posts is currently not allowed')
    ).toBeHidden();
    await presentationModePage.exitPresentation();
  });

  test('should show incoming comments', async ({ page, baseURL }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('Hello!');
    await expect(page.getByText('Hello!', { exact: true })).toBeVisible();
    await participant.createPost('This is a test.');
    await expect(
      page.getByText('This is a test.', { exact: true })
    ).toBeVisible();
    await participant.createPost('Is this the third post?');
    await expect(
      page.getByText('Is this the third post?', { exact: true })
    ).toBeVisible();
    await context.close();
    await presentationModePage.exitPresentation();
  });

  test('should filter posts by favorite and then by correct', async ({
    page,
    baseURL,
  }) => {
    const commentsPage = new CreatorCommentsPage(page, baseURL);
    await commentsPage.goto(shortId);
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('Hello!');
    await participant.createPost('This is a favorite post.');
    await participant.createPost('This is a correct post.');
    await context.close();
    await commentsPage.openMoreMenu(1);
    await commentsPage.performMoreMenuAction('favorite');
    await commentsPage.openMoreMenu(0);
    await commentsPage.performMoreMenuAction('correct');
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await expect(page.getByText('Hello!', { exact: true })).toBeVisible();
    await expect(
      page.getByText('This is a favorite post.', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('This is a correct post.', { exact: true })
    ).toBeVisible();
    await presentationModePage.filterComments('favorite');
    await expect(page.getByText('Hello!', { exact: true })).toBeHidden();
    await expect(
      page.getByText('This is a favorite post.', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText('This is a correct post.', { exact: true })
    ).toBeHidden();
    await presentationModePage.filterComments('correct');
    await expect(page.getByText('Hello!', { exact: true })).toBeHidden();
    await expect(
      page.getByText('This is a favorite post.', { exact: true })
    ).toBeHidden();
    await expect(
      page.getByText('This is a correct post.', { exact: true }).first()
    ).toBeVisible();
    await presentationModePage.exitPresentation();
  });

  test('should sort posts correctly by time by default', async ({
    page,
    baseURL,
  }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    const browser = await chromium.launch();
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

  test('should sort posts correctly by votes', async ({ page, baseURL }) => {
    await header.goToPresentation();
    await page.waitForURL(/present/);
    await presentationModePage.goToComments();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new ParticipantCommentsPage(p, baseURL);
    await participant.goto(shortId);
    await participant.createPost('This is my first post.');
    await participant.createPost('This is another post.');
    await participant.voteUp(1);
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
    await participant.voteDown(0);
    await context.close();
    await expect(
      presentationModePage.getComment(2),
      'Lowest rating should be displayed at the end'
    ).toContainText('This is a third post.');
    await expect(
      presentationModePage.getComment(1),
      'Neutral rating should be displayed in the middle'
    ).toContainText('This is another post.');
    await presentationModePage.exitPresentation();
  });
});
