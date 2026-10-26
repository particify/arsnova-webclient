import { expect, Locator, Page } from '@playwright/test';

const SORT_ITEM_LABEL = /^Position \d+ of \d+: /;

export class ContentGroupPage {
  private readonly joinQuizNameInput: Locator;
  private readonly joinQuizButton: Locator;
  private readonly submitButton: Locator;
  private readonly abstainButton: Locator;
  private readonly overviewLeaderboardTab: Locator;
  private readonly contentResultsTab: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.joinQuizButton = page.getByRole('button', { name: 'join quiz' });
    this.joinQuizNameInput = page.getByTestId('nickname-input');
    this.submitButton = page.getByRole('button', { name: 'submit' });
    this.abstainButton = page.getByRole('button', { name: 'abstain' });
    this.overviewLeaderboardTab = page.getByRole('tab', {
      name: 'leaderboard',
    });
    this.contentResultsTab = page.getByTestId('content-tab-results');
  }

  /**
   * Questionnaire URLs carry the ID, so the series is opened from the room
   * overview by its name, and then the content by its step.
   */
  async goto(shortId: string, seriesName: string, index = 1) {
    await this.page.goto(`${this.baseURL}/p/${shortId}`);
    await this.page.getByRole('button', { name: seriesName }).click();
    await this.page.waitForURL(/\/questionnaire\/[^/]+/);
    if (index > 1) {
      await this.goToStep(index);
    }
  }

  getStepButton(step: number): Locator {
    return this.page.getByTestId('step-button').nth(step - 1);
  }

  async goToStep(step: number) {
    await this.getStepButton(step).click();
  }

  async joinQuiz(nickname?: string) {
    if (nickname) {
      await this.joinQuizNameInput.fill(nickname);
    }
    await this.joinQuizButton.click();
  }

  async answerContent(labels?: string[]) {
    if (labels) {
      for (const label of labels) {
        await this.page.getByText(label, { exact: true }).click();
      }
      await this.submitButton.click();
      return;
    }
    await this.abstainButton.click();
  }

  async answerTextContent(answer?: string) {
    if (answer) {
      await this.page.getByLabel('your answer').fill(answer);
      await this.submitButton.click();
      return;
    }
    await this.abstainButton.click();
  }

  async answerWordcloudContent(answers?: string[]) {
    if (answers) {
      for (const [index, answer] of answers.entries()) {
        await this.page.getByPlaceholder('keyword ' + (index + 1)).fill(answer);
      }
      await this.submitButton.click();
      return;
    }
    await this.abstainButton.click();
  }

  async answerPrioritizationContent(assignedPoints?: Record<string, number>) {
    if (assignedPoints) {
      for (const [item, points] of Object.entries(assignedPoints)) {
        await this.page
          .getByRole('spinbutton', { name: item, exact: true })
          .fill(points.toString());
      }
      await this.submitButton.click();
      return;
    }
    await this.abstainButton.click();
  }

  async answerLikertContent(option?: string) {
    if (option) {
      await this.page.getByText(option, { exact: true }).click();
      await this.submitButton.click();
      return;
    }
    await this.abstainButton.click();
  }

  getSubmitButton() {
    return this.submitButton;
  }

  async goToNextContent() {
    await this.page.getByRole('button', { name: 'next content' }).click();
  }

  getGoToOverviewButton() {
    return this.page.getByRole('button', { name: 'go to overview' });
  }

  getHintAfterAnswering() {
    return this.page.getByText('You have answered.');
  }

  getHintAfterAbstaining() {
    return this.page.getByText('You have abstained.');
  }

  getCorrectStateIcon(state: 'correct' | 'wrong') {
    return this.page.getByTestId(state + '-icon');
  }

  getHintAfterContentStoppedWithoutAnswering() {
    return this.page.getByText("didn't answer in time");
  }

  getWaitingHint() {
    return this.page.getByText(/get ready/i);
  }

  getFirstRadioButton() {
    return this.page.getByRole('radio').first();
  }

  async switchToLeaderboardTab() {
    await this.overviewLeaderboardTab.click();
  }

  async switchToResultsTab() {
    await this.contentResultsTab.click();
  }

  async answerNumericContent(value: number) {
    await this.page
      .getByRole('spinbutton', { name: 'Your answer' })
      .fill(String(value));
    await this.submitButton.click();
  }

  getNumericVerdict(correct: boolean): Locator {
    return this.page.getByTestId(
      correct ? 'numeric-answer-correct' : 'numeric-answer-wrong'
    );
  }

  /**
   * Brings the sort items into the given order with the keyboard. The order the
   * participant starts from is a shuffle of the shuffled storage order, so it
   * is read from the page rather than assumed.
   */
  async arrangeSortItems(order: string[]) {
    const items = this.page.getByLabel(SORT_ITEM_LABEL);
    const labels = async () =>
      (
        await items.evaluateAll((elements) =>
          elements.map((element) => element.getAttribute('aria-label') ?? '')
        )
      ).map((label) => label.replace(SORT_ITEM_LABEL, '').replace(/\.$/, ''));
    // The list re-renders and refocuses after every move, so the next move is
    // always derived from the order shown now.
    await expect(async () => {
      const shown = await labels();
      const target = shown.findIndex((label, i) => label !== order[i]);
      if (target >= 0) {
        await items.nth(shown.indexOf(order[target])).focus();
        await this.page.keyboard.press('ArrowUp');
      }
      expect(await labels()).toEqual(order);
    }).toPass({ timeout: 20000 });
  }
}
