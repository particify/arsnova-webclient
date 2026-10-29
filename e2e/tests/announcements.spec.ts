import { test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { AnnouncementsCard } from '@e2e/fixtures/creator/announcements';
import { RoomOverviewPage } from '@e2e/fixtures/participant/room-overview';

test.describe('announcements', () => {
  let announcements: AnnouncementsCard;
  let roomSettings: RoomSettingsPage;
  let homePage: HomePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    announcements = new AnnouncementsCard(page);
    roomSettings = new RoomSettingsPage(page, baseURL);
    homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('Room 1');
  });

  test.afterEach(async () => {
    await roomSettings.deleteRoomById(shortId);
  });

  test('create announcement', async () => {
    await announcements.createButton.click();
    await expect(announcements.titleInput).toBeFocused();
    await announcements.titleInput.fill('Awesome title');
    await announcements.bodyInput.fill(
      'This is a very important announcement.'
    );
    await announcements.dialog.getByRole('button', { name: 'publish' }).click();
    await expect(announcements.titleInput).toBeHidden();
    await expect(announcements.item('Awesome title')).toBeFocused();
    await expect(
      announcements
        .item('Awesome title')
        .getByText('This is a very important announcement.')
    ).toBeVisible();
  });

  test('edit announcement', async () => {
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await announcements.startEditing('Awesome title');
    await expect(announcements.titleInput).toBeFocused();
    await announcements.titleInput.fill('Another title');
    await announcements.bodyInput.fill('This announcement was edited.');
    await announcements.dialog.getByRole('button', { name: 'save' }).click();
    await expect(announcements.titleInput).toBeHidden();
    await expect(
      announcements.item('Another title').getByTestId('edit-announcement')
    ).toBeFocused();
    await expect(
      announcements
        .item('Another title')
        .getByText('This announcement was edited.')
    ).toBeVisible();
  });

  test('cancel announcement editing', async () => {
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await announcements.startEditing('Awesome title');
    await announcements.dialog.getByRole('button', { name: 'cancel' }).click();
    await expect(announcements.titleInput).toBeHidden();
    await expect(
      announcements.item('Awesome title').getByTestId('edit-announcement')
    ).toBeFocused();
  });

  test('escape closes the dialog, asking about unsaved input', async ({
    page,
  }) => {
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await announcements.startEditing('Awesome title');
    await announcements.titleInput.fill('Another title');
    await page.keyboard.press('Escape');
    await page
      .locator('app-base-dialog')
      .getByRole('button', { name: 'discard' })
      .click();
    await expect(announcements.titleInput).toBeHidden();
    await expect(announcements.item('Awesome title')).toBeVisible();
  });

  test('clicking outside keeps a draft unless it is discarded', async ({
    page,
  }) => {
    await announcements.createButton.click();
    await announcements.titleInput.fill('Draft title');
    await page.mouse.click(5, 5);
    await page
      .locator('app-base-dialog')
      .getByRole('button', { name: 'cancel' })
      .click();
    await expect(page.locator('app-base-dialog')).toBeHidden();
    await expect(announcements.titleInput).toHaveValue('Draft title');
    await page.mouse.click(5, 5);
    await page
      .locator('app-base-dialog')
      .getByRole('button', { name: 'discard' })
      .click();
    await expect(announcements.titleInput).toBeHidden();
  });

  test('escape closes an untouched draft and returns to Create', async ({
    page,
  }) => {
    await announcements.createButton.click();
    await page.keyboard.press('Escape');
    await expect(announcements.titleInput).toBeHidden();
    await expect(announcements.createButton).toBeFocused();
  });

  test('delete announcement', async ({ page }) => {
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await announcements.startDeleting('Awesome title');
    await Promise.all([
      page.waitForResponse(
        (res) =>
          !!res.request().postData()?.includes('DeleteAnnouncement') && res.ok()
      ),
      page
        .locator('app-base-dialog')
        .getByRole('button', { name: 'delete' })
        .click(),
    ]);
    await expect(announcements.item('Awesome title')).toBeHidden();
  });

  test('cancel announcement deletion', async ({ page }) => {
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await announcements.startDeleting('Awesome title');
    await page
      .locator('app-base-dialog')
      .getByRole('button', { name: 'cancel' })
      .click();
    await expect(announcements.item('Awesome title')).toBeVisible();
  });

  test('created announcements stay shown on top', async () => {
    for (const n of [1, 2, 3]) {
      await announcements.create(`Title ${n}`, `Body ${n}`);
    }
    for (const n of [1, 2, 3]) {
      await expect(announcements.item(`Title ${n}`)).toBeVisible();
    }
    await expect(announcements.toggle).toBeHidden();
  });

  test('expand and collapse the announcements', async ({ page }) => {
    for (const n of [1, 2, 3]) {
      await announcements.create(`Title ${n}`, `Body ${n}`);
    }
    // Announcements created here all stay shown; a reload shows the latest only.
    await page.reload();
    await expect(announcements.toggle).toHaveText(/\(3\)/);
    await expect(announcements.toggle).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(announcements.item('Title 1')).toBeHidden();
    await announcements.toggle.click();
    await expect(announcements.toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(announcements.toggle).toBeFocused();
    await expect(announcements.item('Title 1')).toBeVisible();
    await announcements.toggle.click();
    await expect(announcements.toggle).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(announcements.item('Title 1')).toBeHidden();
  });

  test('get announcement for room as participant', async ({
    baseURL,
    browser,
  }) => {
    const context = await browser.newContext();
    const p = await context.newPage();
    const participant = new RoomOverviewPage(p, baseURL);
    await participant.goto(shortId);
    await announcements.create(
      'Awesome title',
      'This is a very important announcement.'
    );
    await p.reload();
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
    await context.close();
  });
});
