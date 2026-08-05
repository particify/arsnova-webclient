import { Locator, Page } from '@playwright/test';
import { waitForOperation } from '@e2e/fixtures/shared/graphql';

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
      waitForOperation(this.page, 'CreateQuestionnaire'),
      await this.submitSeriesCreationButton.click(),
    ]);
    // Creating a series opens its content creation, which is the page to be on afterwards.
    await this.page.waitForURL(/\/questionnaire\/[^/]+\/create/);
  }

  async publishQuestionSeries(name: string) {
    await this.page.getByRole('button', { name: name }).hover();
    await this.page.getByTestId('publish-group-btn').click();
  }

  async createQuestionnaire(name: string, type: string): Promise<string> {
    await this.createSeriesButton.click();
    await this.questionSeriesNameInput.fill(name);
    await this.page.getByTestId(type).click();
    await this.submitSeriesCreationButton.click();
    await this.page.waitForURL(/\/questionnaire\/[^/]+/);
    const match = /\/questionnaire\/([^/]+)/.exec(this.page.url());
    if (!match) {
      throw new Error('Could not determine created questionnaire ID.');
    }
    return match[1];
  }
}
