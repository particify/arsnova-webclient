import { Locator, Page } from '@playwright/test';

export class RoomSettingsPage {
  private readonly deleteRoomButton: Locator;
  private readonly confirmDeleteRoomButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.deleteRoomButton = page.getByText('delete room');
    this.confirmDeleteRoomButton = page.getByText('Delete', { exact: true });
  }

  async goto(shortId: string) {
    await this.page.goto(`${this.baseURL}/edit/${shortId}/settings`);
  }

  async deleteRoom() {
    await this.deleteRoomButton.click();
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/api/room/') &&
          res.ok() &&
          res.ok() &&
          res.request().method() === 'DELETE'
      ),
      this.confirmDeleteRoomButton.click(),
    ]);
  }

  async saveSettings() {
    await this.page.getByRole('button', { name: 'save' }).click();
  }

  async updateName(name: string) {
    await this.page.getByRole('textbox').first().fill(name);
    await this.saveSettings();
  }

  async updateDescription(description: string) {
    await this.page
      .getByRole('textbox', { name: 'description' })
      .fill(description);
    await this.saveSettings();
  }

  async setLanguage(lang: string) {
    await this.page.getByRole('combobox', { name: 'Language' }).click();
    await this.page.getByRole('option', { name: lang }).click();
    await this.saveSettings();
  }

  async toggleFocusMode() {
    await this.page.getByLabel('guide the participants').click();
    await this.saveSettings();
  }
}
