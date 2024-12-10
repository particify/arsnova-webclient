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
          res.status() === 200 &&
          res.request().method() === 'DELETE'
      ),
      this.confirmDeleteRoomButton.click(),
    ]);
  }
}
