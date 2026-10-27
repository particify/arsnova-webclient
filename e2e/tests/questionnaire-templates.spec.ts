import { Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { VERIFIED_ADMIN_STORAGE_STATE } from '@e2e/fixtures/shared/login';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';

test.describe('questionnaire templates', () => {
  // Only verified accounts can create templates.
  test.use({ storageState: VERIFIED_ADMIN_STORAGE_STATE });

  let shortId: string;
  let roomSettings: RoomSettingsPage;
  let templateUrl: string | undefined;
  // Unique per test, so parallel tests and leftovers never get in each other's way.
  let templateName: string;
  let tagName: string;

  async function createTemplate(page: Page) {
    await new ContentGroupOverviewPage(page, undefined).openGroupMoreMenu();
    await page.getByRole('menuitem', { name: 'Use as template' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create template' });
    await dialog.getByRole('textbox', { name: 'Name' }).waitFor();
    await dialog.getByRole('textbox', { name: 'Name' }).fill(templateName);
    await dialog
      .getByRole('textbox', { name: 'Description' })
      .fill('A quiz about planets.');
    await dialog.getByRole('switch', { name: /Publish template/ }).check();
    await addTag(page);
    await dialog.getByRole('button', { name: 'Create' }).click();
    await expect(dialog).toBeHidden();
  }

  /** A new, unverified tag is offered for creation rather than for selection. */
  async function addTag(page: Page) {
    await page.locator('mat-chip-grid input').fill(tagName);
    await page.getByRole('option', { name: /Create new tag/i }).click();
  }

  async function openOwnTemplate(page: Page, baseURL: string | undefined) {
    await page.goto(`${baseURL}/templates/my`);
    await page.getByText(templateName, { exact: true }).click();
    await page.waitForURL(/\/templates\/[^/]+$/);
    templateUrl = page.url();
  }

  test.beforeEach(async ({ page, baseURL }) => {
    const suffix = `${Date.now().toString(36)}${test.info().workerIndex}`;
    templateName = `Template ${suffix}`;
    tagName = `tag ${suffix}`;
    roomSettings = new RoomSettingsPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My template room');
    await new CreatorRoomOverviewPage(page, baseURL).createQuestionSeries(
      'My planet quiz',
      'Quiz'
    );
    await new ContentCreationPage(page, baseURL).createChoiceContent(
      'Which planet is closest to the sun?',
      ['Mercury', 'Venus'],
      ['Mercury'],
      false,
      false
    );
    await createTemplate(page);
  });

  test.afterEach(async ({ page, baseURL }) => {
    try {
      // The template outlives its room, so it is deleted on its own.
      await openOwnTemplate(page, baseURL);
      await page.getByRole('button').filter({ hasText: 'more_vert' }).click();
      await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.waitForURL(/\/templates$/);
    } finally {
      templateUrl = undefined;
      await roomSettings.deleteRoomById(shortId);
    }
  });

  test('a created template is listed with its contents', async ({
    page,
    baseURL,
  }) => {
    await openOwnTemplate(page, baseURL);
    await expect(page.getByText('A quiz about planets.')).toBeVisible();
    await expect(
      page.getByText('Which planet is closest to the sun?')
    ).toBeVisible();
    await expect(page.getByText(tagName)).toBeVisible();
  });

  test('a template can be added to a room', async ({ page, baseURL }) => {
    await openOwnTemplate(page, baseURL);
    await page.getByRole('button', { name: 'Use', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Select room' })
      .getByText(`(${shortId})`)
      .click();
    await page.waitForURL(new RegExp(`/edit/${shortId}`));
    await expect(
      page.getByRole('button', { name: new RegExp(templateName) })
    ).toBeVisible();
  });

  test('the owner edits the template', async ({ page, baseURL }) => {
    await openOwnTemplate(page, baseURL);
    await page.getByRole('button').filter({ hasText: 'more_vert' }).click();
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('textbox', { name: 'Description' })
      .fill('A quiz about the solar system.');
    // The template's tag is still selected.
    await expect(dialog.getByText(tagName)).toBeVisible();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByText('A quiz about the solar system.')
    ).toBeVisible();
  });

  test('guests cannot report a template', async ({
    page,
    baseURL,
    browser,
  }) => {
    await openOwnTemplate(page, baseURL);
    const guest = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    try {
      const guestPage = await guest.newPage();
      await guestPage.goto(templateUrl!);
      await expect(guestPage.getByText(templateName)).toBeVisible();
      await guestPage
        .getByRole('button')
        .filter({ hasText: 'more_vert' })
        .click();
      await expect(
        guestPage.getByRole('menuitem', { name: 'Report template' })
      ).toBeDisabled();
    } finally {
      await guest.close();
    }
  });
});
