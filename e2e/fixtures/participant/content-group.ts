import { Locator, Page } from '@playwright/test';

export class ContentGroupPage {
  private readonly joinQuizNameInput: Locator;
  private readonly joinQuizButton: Locator;
  private readonly submitButton: Locator;
  private readonly abstainButton: Locator;
  private readonly overviewLeaderboardTab: Locator;

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
  }

  async goto(shortId: string, seriesName: string, index = 1) {
    await this.page.goto(
      `${this.baseURL}/p/${shortId}/series/${seriesName}/${index}`
    );
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

  getFirstRadioButton() {
    return this.page.getByRole('radio').first();
  }

  async switchToLeaderboardTab() {
    await this.overviewLeaderboardTab.click();
  }
}
