import { readFile, writeFile } from 'node:fs/promises';
import { Page, test, expect } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Snackbar } from '@e2e/fixtures/shared/snackbar';
import { RoomOverviewPage as CreatorRoomOverviewPage } from '@e2e/fixtures/creator/room-overview';
import { RoomSettingsPage } from '@e2e/fixtures/creator/room-settings';
import { ContentCreationPage } from '@e2e/fixtures/creator/content-creation';
import { ContentGroupOverviewPage } from '@e2e/fixtures/creator/content-group-overview';

/**
 * The contents of a series leave as a CSV file and come back through the
 * import of another series unchanged, through the REST endpoints of the
 * backend.
 */
test.describe('questionnaire CSV export and import', () => {
  let creatorPage: Page;
  let shortId: string;
  let roomOverview: CreatorRoomOverviewPage;
  let contentGroupOverview: ContentGroupOverviewPage;

  const bodies = ['Pick the second one', 'Tell us more', 'Name three words'];

  /** The file as exported, in the dialog's default type and charset. */
  async function exportedFile(): Promise<Buffer> {
    const download = await contentGroupOverview.exportContents();
    return readFile(await download.path());
  }

  function text(file: Buffer): string {
    const utf16 = file[0] === 0xff && file[1] === 0xfe;
    return new TextDecoder(utf16 ? 'utf-16le' : 'utf-8').decode(file);
  }

  test.beforeEach(async ({ page, baseURL }) => {
    creatorPage = page;
    roomOverview = new CreatorRoomOverviewPage(page, baseURL);
    contentGroupOverview = new ContentGroupOverviewPage(page, baseURL);
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('My room');
    await roomOverview.createQuestionSeries('My series', 'Mixed');
    const contentCreation = new ContentCreationPage(page, baseURL);
    await contentCreation.createChoiceContent(
      bodies[0],
      ['first', 'second', 'third'],
      ['second']
    );
    await contentCreation.createTextContent(bodies[1]);
    await contentCreation.createWordcloudContent(bodies[2], 5);
    await expect(contentGroupOverview.getContents()).toHaveCount(3);
  });

  test.afterEach(async ({ baseURL }) => {
    await new RoomSettingsPage(creatorPage, baseURL).deleteRoomById(shortId);
  });

  test('imports the exported contents into another series unchanged', async () => {
    const exported = await exportedFile();
    const file = test.info().outputPath('contents.csv');
    await writeFile(file, exported);
    for (const body of bodies) {
      expect(text(exported)).toContain(body);
    }

    await roomOverview.goto(shortId);
    await roomOverview.createQuestionSeries('My copy', 'Mixed');
    await contentGroupOverview.importContents(file);

    await expect(
      new Snackbar(creatorPage).getSnackbar().filter({ hasText: 'imported' })
    ).toBeVisible();
    const contents = contentGroupOverview.getContents();
    await expect(contents).toHaveCount(3);
    for (const [i, body] of bodies.entries()) {
      await expect(contents.nth(i)).toContainText(body);
    }
    // Format data and settings are part of the file, so a second export of
    // the copy matches the first.
    expect(text(await exportedFile())).toBe(text(exported));
  });
});
