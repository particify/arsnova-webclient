import { Locator, Page } from '@playwright/test';

export class RoomOverviewPage {
  private readonly commentsButton: Locator;
  private readonly createSeriesButton: Locator;
  private readonly questionSeriesNameInput: Locator;
  private readonly submitSeriesCreationButton: Locator;
  private readonly liveFeedbackButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.commentsButton = page.getByRole('button', {
      name: 'Open Q&A',
    });
    this.createSeriesButton = page.getByText('create question series');
    this.questionSeriesNameInput = page.getByLabel(
      'name of the question series'
    );
    this.submitSeriesCreationButton = page.getByRole('button', {
      name: 'create',
    });
    this.liveFeedbackButton = page.getByRole('button', {
      name: 'Open Live Feedback',
    });
  }

  async goto(shortId: string) {
    await this.page.goto(`${this.baseURL}/edit/${shortId}`);
  }

  async startComments() {
    await this.commentsButton.hover();
    await this.page.getByTestId('start-comments').click();
  }

  async goToComments() {
    return await this.commentsButton.click();
  }

  async goToLiveFeedback() {
    return await this.liveFeedbackButton.click();
  }

  async createQuestionSeries(name: string, type: string) {
    await this.createSeriesButton.click();
    await this.questionSeriesNameInput.fill(name);
    await this.page.getByTestId(type).click();
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/contentgroup/') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      await this.submitSeriesCreationButton.click(),
    ]);
  }

  async publishQuestionSeries(name: string) {
    await this.page.getByRole('button', { name: name }).hover();
    await this.page.getByTestId('publish-group-btn').click();
  }
}
