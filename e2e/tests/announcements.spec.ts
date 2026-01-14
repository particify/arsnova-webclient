import { test, expect, Page, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { RoomOverviewPage } from '@e2e/fixtures/participant/room-overview';

test.describe('announcements', () => {
  let header: Header;
  let roomSettings: RoomSettingsPage;
  let homePage: HomePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('Room 1');
    await header.goToSettings('Announcements');
  });

  test.afterEach(async () => {
    await header.goToSettings('Room');
    await roomSettings.deleteRoom();
  });

  test('go to announcement settings', async ({ page }) => {
    await page.waitForURL(/\/settings\/announcements/);
  });

  test('create announcement', async ({ page }) => {
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    await expect(page.getByPlaceholder('enter your content')).toBeEmpty();
    await expect(page.getByLabel('Title', { exact: true })).toBeEmpty();
    await expect(
      page.getByText('Awesome title', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page
        .getByText('This is a very important announcement.', { exact: true })
        .first()
    ).toBeVisible();
  });

  test('edit announcement', async ({ page }) => {
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    await page.getByTestId('announcement-more-options-btn').click();
    await page.getByRole('menuitem', { name: 'edit' }).click();
    await page.getByLabel('Title', { exact: true }).fill('Another title');
    await page
      .getByPlaceholder('enter your content')
      .fill('This announcement was edited.');
    await page.getByRole('button', { name: 'save' }).click();
    await expect(page.getByPlaceholder('enter your content')).toBeEmpty();
    await expect(page.getByLabel('Title', { exact: true })).toBeEmpty();
    await expect(
      page.getByText('Another title', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText('This announcement was edited.', { exact: true }).first()
    ).toBeVisible();
  });

  test('cancel announcement editing', async ({ page }) => {
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    await page.getByTestId('announcement-more-options-btn').click();
    await page.getByRole('menuitem', { name: 'edit' }).click();
    await page.getByLabel('Title', { exact: true }).fill('Another title');
    await page
      .getByPlaceholder('enter your content')
      .fill('This announcement was edited.');
    await page.getByRole('button', { name: 'cancel' }).click();
    await expect(page.getByPlaceholder('enter your content')).toBeEmpty();
    await expect(page.getByLabel('Title', { exact: true })).toBeEmpty();
    await expect(
      page.getByText('Awesome title', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText('This is a very important announcement.', { exact: true })
    ).toBeVisible();
  });

  test('delete announcement', async ({ page }) => {
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    await page.getByTestId('announcement-more-options-btn').click();
    await page.getByRole('menuitem', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'delete' }).click();
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('DeleteAnnouncement') && res.ok()
    );
    await expect(
      page.getByText('Awesome title', { exact: true }).first()
    ).toBeHidden();
    await expect(
      page.getByText('This is a very important announcement.', { exact: true })
    ).toBeHidden();
  });

  test('cancel announcement deletion', async ({ page }) => {
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    await page.getByTestId('announcement-more-options-btn').click();
    await page.getByRole('menuitem', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'cancel' }).click();
    await expect(
      page.getByText('Awesome title', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByText('This is a very important announcement.', { exact: true })
    ).toBeVisible();
  });

  test('get announcement for room as participant', async ({
    page,
    baseURL,
  }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new RoomOverviewPage(p, baseURL);
    await participant.goto(shortId);
    await addAnnouncement(
      page,
      'Awesome title',
      'This is a very important announcement.'
    );
    p.reload();
    await expect(p.getByTestId('announcement-icon-with-badge')).toContainText(
      '1'
    );
    await p.getByTestId('announcement-icon-with-badge').click();
    await expect(
      p.getByText('Awesome title', { exact: true }).first()
    ).toBeVisible();
    await expect(
      p.getByText('This is a very important announcement.', { exact: true })
    ).toBeVisible();
    await p.getByRole('button', { name: 'close' }).click();
    await expect(
      p.getByTestId('announcement-icon-with-badge')
    ).not.toContainText('1');
  });
});

async function addAnnouncement(page: Page, title: string, body: string) {
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByPlaceholder('enter your content').fill(body);
  await page.getByRole('button', { name: 'create' }).click();
  await page.waitForResponse(
    (res) =>
      !!res.request().postData()?.includes('CreateAnnouncement') && res.ok()
  );
}
