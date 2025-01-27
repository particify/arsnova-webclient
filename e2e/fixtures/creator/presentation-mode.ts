import { Page } from '@playwright/test';

export class PresentationModePage {
  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {}

  async goto(shortId: string, featureName?: string, seriesName?: string) {
    let url = `${this.baseURL}/present/${shortId}/`;
    if (featureName) {
      url += featureName;
      if (seriesName) {
        url += '/' + seriesName;
      }
    }
    await this.page.goto(url);
  }

  async exitPresentation() {
    await this.page.getByTestId('exit-btn').click();
  }

  async openFullScreen() {
    await this.page.getByTestId('fullscreen-btn').click();
  }

  async goToComments() {
    await this.page.getByRole('button', { name: 'Q&A' }).click();
  }

  async goToLiveFeedback() {
    await this.page.getByRole('button', { name: 'Live Feedback' }).click();
  }

  async goToQuestionSeries() {
    await this.page.getByRole('button', { name: 'Question series' }).click();
  }

  async copyUrl() {
    await this.page.getByLabel('Copy link').click();
  }
}
