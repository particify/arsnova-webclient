import { Locator, Page } from '@playwright/test';

export class RoomOverviewPage {
  private readonly commentsButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.commentsButton = page.getByRole('button', {
      name: 'Q&A',
    });
  }

  async goto(shortId: string) {
    await this.page.goto(`${this.baseURL}/p/${shortId}`);
  }

  async goToComments() {
    return await this.commentsButton.click();
  }

  async goToContentGroup(name: string) {
    await this.page.getByRole('button', { name: name }).click();
  }
}
