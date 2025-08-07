import { Locator, Page } from '@playwright/test';

export class ContentCreationPage {
  private readonly createContentButton: Locator;
  private readonly contentBodyInput: Locator;
  private readonly newAnswerInput: Locator;
  private readonly formatSelection: Locator;
  private readonly formatOption: Locator;
  private readonly multipleToggle: Locator;
  private readonly correctOptionsToggle: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.createContentButton = page.getByRole('button', {
      name: 'Create',
      exact: true,
    });
    this.contentBodyInput = page.getByRole('textbox', { name: 'Content' });
    this.newAnswerInput = page.getByLabel('Add option');
    this.formatSelection = page.getByTestId('format-selection');
    this.formatOption = page.getByRole('option');
    this.multipleToggle = this.page.getByRole('switch', {
      name: 'select multiple options',
    });
    this.correctOptionsToggle = this.page.getByRole('switch', {
      name: 'set correct answer',
    });
  }

  async goto(shortId: string, seriesName: string) {
    await this.page.goto(
      `${this.baseURL}/edit/${shortId}/series/${seriesName}/create`
    );
  }

  async createChoiceContent(
    body: string,
    answerOptions: string[],
    correctOptions?: string[],
    multiple = false,
    mixed = true
  ) {
    await this.selectFormat('Multiple choice');
    await this.contentBodyInput.fill(body);
    if (mixed) {
      await this.correctOptionsToggle.setChecked(!!correctOptions);
    }
    await this.multipleToggle.setChecked(multiple);
    for (const option of answerOptions) {
      await this.newAnswerInput.fill(option);
      await this.page.keyboard.press('Enter');
      if (correctOptions !== undefined && correctOptions.includes(option)) {
        await this.page
          .getByTestId('answer-' + answerOptions.indexOf(option))
          .click();
      }
    }
    await this.submitContent();
  }

  async createLikertContent(
    body: string,
    template: string,
    neutralOption = true
  ) {
    await this.selectFormat('Likert');
    await this.contentBodyInput.fill(body);
    if (neutralOption === false) {
      await this.page
        .getByRole('switch', { name: 'offer neutral option' })
        .click();
    }
    await this.page.getByRole('combobox', { name: 'answer template' }).click();
    await this.page.getByRole('option', { name: template }).click();
    await this.submitContent();
  }

  async createBinaryContent(
    body: string,
    correctOption?: string,
    mixed = false
  ) {
    await this.selectFormat('Yes / No');
    await this.contentBodyInput.fill(body);
    if (mixed) {
      await this.correctOptionsToggle.setChecked(!!correctOption);
    }
    if (correctOption !== undefined) {
      await this.page
        .getByText('“' + correctOption + '”', { exact: true })
        .click();
    }
    await this.submitContent();
  }

  async createTextContent(body: string) {
    await this.selectFormat('Open question');
    await this.contentBodyInput.fill(body);
    await this.submitContent();
  }

  async createWordcloudContent(body: string, keywordsPerAnswer?: number) {
    await this.selectFormat('Word cloud');
    await this.contentBodyInput.fill(body);
    if (keywordsPerAnswer) {
      await this.page
        .getByLabel('keywords per answer')
        .fill(keywordsPerAnswer.toString());
    }
    await this.submitContent();
  }

  async createPrioritizationContent(body: string, answerOptions: string[]) {
    await this.selectFormat('Prioritization');
    await this.contentBodyInput.fill(body);
    for (const option of answerOptions) {
      await this.newAnswerInput.fill(option);
      await this.page.keyboard.press('Enter');
    }
    await this.submitContent();
  }

  async createShortAnswerContent(body: string, correctOptions: string[]) {
    await this.selectFormat('Short answer');
    await this.contentBodyInput.fill(body);
    for (const option of correctOptions) {
      await this.newAnswerInput.fill(option);
      await this.page.keyboard.press('Enter');
    }
    await this.submitContent();
  }

  async createSortContent(body: string, answerOptions: string[]) {
    await this.selectFormat('Sort');
    await this.contentBodyInput.fill(body);
    for (const option of answerOptions) {
      await this.newAnswerInput.fill(option);
      await this.page.keyboard.press('Enter');
    }
    await this.submitContent();
  }

  async createNumericContent(
    body: string,
    min: number,
    max: number,
    correct?: number,
    tolerance?: number,
    mixed = false
  ) {
    await this.selectFormat('Find the number');
    await this.contentBodyInput.fill(body);
    await this.page.getByLabel('minimum').fill(min.toString());
    await this.page.getByLabel('maximum').fill(max.toString());
    if (mixed) {
      await this.correctOptionsToggle.setChecked(correct !== undefined);
    }
    if (correct !== undefined) {
      await this.page
        .getByLabel('Correct answer', { exact: true })
        .fill(correct.toString());
    }
    if (tolerance !== undefined) {
      await this.page
        .getByLabel('Tolerance (optional)', { exact: true })
        .fill(tolerance.toString());
    }
    await this.submitContent();
  }

  async createFlashcardContent(body: string, answer: string) {
    await this.selectFormat('Flashcard');
    await this.contentBodyInput.fill(body);
    await this.page.getByRole('textbox', { name: 'answer' }).fill(answer);
    await this.submitContent();
  }

  async createSlideContent(body: string) {
    await this.selectFormat('Slide');
    await this.contentBodyInput.fill(body);
    await this.submitContent();
  }

  async submitContent() {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/content/') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/contentgroup/') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      this.createContentButton.click(),
    ]);
  }

  async selectFormat(name: string) {
    const format = await this.formatSelection.innerText();
    if (format.includes(name)) {
      return;
    }
    await this.formatSelection.click();
    await this.formatOption.getByText(name).first().click();
  }
}
