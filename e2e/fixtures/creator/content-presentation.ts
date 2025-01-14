import { Page } from '@playwright/test';

export class ContentPresentationPage {
  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {}

  async goto(shortId: string, seriesName: string) {
    await this.page.goto(
      `${this.baseURL}/present/${shortId}/series/${seriesName}`
    );
  }

  async startContent() {
    await this.page.getByRole('button', { name: 'start' }).click();
  }

  async exitPresentation() {
    await this.page.keyboard.press('Escape');
  }

  async toggleResults(show: boolean) {
    await this.page.keyboard.press('Space');
    await this.page
      .locator('canvas')
      .waitFor({ state: show ? 'visible' : 'hidden' });
    if (show) {
      await this.page.waitForTimeout(500);
    }
  }

  async toggleLeaderboard(show: boolean) {
    await this.page.keyboard.press('l');
    await this.page
      .getByRole('table')
      .waitFor({ state: show ? 'visible' : 'hidden' });
  }
}
