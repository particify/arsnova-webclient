import { Locator, Page } from '@playwright/test';

/** The announcements card on the creator room overview, where announcements are managed. */
export class AnnouncementsCard {
  readonly card: Locator;
  readonly createButton: Locator;
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly bodyInput: Locator;
  readonly toggle: Locator;

  constructor(public readonly page: Page) {
    this.card = page.locator('app-announcements-card');
    this.createButton = this.card.getByTestId('create-announcement');
    this.dialog = page.locator('app-announcement-dialog');
    this.titleInput = this.dialog.getByLabel('Title', { exact: true });
    this.bodyInput = this.dialog.getByPlaceholder('enter your content');
    this.toggle = this.card.getByTestId('toggle-announcements');
  }

  item(title: string): Locator {
    return this.card
      .getByTestId('announcement-item')
      .filter({ hasText: title });
  }

  async create(title: string, body: string) {
    await this.createButton.click();
    await this.titleInput.fill(title);
    await this.bodyInput.fill(body);
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          !!res.request().postData()?.includes('CreateAnnouncement') && res.ok()
      ),
      this.dialog.getByRole('button', { name: 'publish' }).click(),
    ]);
  }

  async startEditing(title: string) {
    await this.item(title).hover();
    await this.item(title).getByTestId('edit-announcement').click();
  }

  async startDeleting(title: string) {
    await this.item(title).hover();
    await this.item(title).getByTestId('delete-announcement').click();
  }
}
