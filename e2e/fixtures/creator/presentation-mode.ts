import { Locator, Page } from '@playwright/test';

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

  async hoverControlBar() {
    // Move mouse to bottom to ensure control bar is visible
    await this.page.mouse.move(
      100,
      (this.page.viewportSize()?.height ?? 500) - 50
    );
  }

  async exitPresentation() {
    await this.hoverControlBar();
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

  // Contents

  async publishContentGroup(mode?: string, isLive = false) {
    if (!isLive) {
      await this.page.getByRole('radio', { name: mode }).click();
    }
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/content/?ids=') &&
          res.ok() &&
          res.request().method() === 'GET'
      ),
      this.page.getByRole('button', { name: 'Publish' }).click(),
    ]);
  }

  async startContent() {
    await this.hoverControlBar();
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/content/') &&
          res.ok() &&
          res.request().method() === 'GET'
      ),
      this.page.getByRole('button', { name: 'start the content' }).click(),
    ]);
  }

  async stopContent() {
    await this.hoverControlBar();
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/content/') &&
          res.ok() &&
          res.request().method() === 'GET'
      ),
      this.page.getByRole('button', { name: 'stop the content' }).click(),
    ]);
  }

  async publishContent() {
    await this.hoverControlBar();
    await this.page.getByRole('button', { name: 'publish content' }).click();
  }

  async openContentMoreMenu() {
    await this.hoverControlBar();
    await this.page.getByRole('button', { name: 'more' }).click();
  }

  async startNewRound() {
    await this.openContentMoreMenu();
    await this.page.getByRole('menuitem', { name: 'start new round' }).click();
    await this.page.getByRole('button', { name: 'Start', exact: true }).click();
  }

  async deleteContentAnswers() {
    await this.openContentMoreMenu();
    await this.page.getByTestId('delete-content-answer-button').click();
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/answer') &&
          res.ok() &&
          res.request().method() === 'DELETE'
      ),
      this.page.getByRole('button', { name: 'Delete', exact: true }).click(),
    ]);
  }

  async goToDisplaySettings() {
    await this.openContentMoreMenu();
    await this.page.getByRole('menuitem', { name: 'display settings' }).click();
  }

  async goToContentEdit() {
    await this.openContentMoreMenu();
    await this.page.getByRole('menuitem', { name: 'edit' }).click();
  }

  async showResults() {
    await this.hoverControlBar();
    await this.page.getByRole('button', { name: 'Results' }).click();
  }

  async showCorrectResults() {
    await this.hoverControlBar();
    await this.page.getByRole('button', { name: 'Correct' }).click();
  }

  async showLeaderboard() {
    await this.hoverControlBar();
    await this.page.getByRole('button', { name: 'leaderboard' }).click();
  }

  async goToNextContent() {
    await this.hoverControlBar();
    await this.page.getByTestId('right-btn').click();
  }

  async goToPreviousContent() {
    await this.hoverControlBar();
    await this.page.getByTestId('left-btn').click();
  }

  // Comments

  async enableComments() {
    await this.page.getByRole('button', { name: 'Enable Q&A' }).click();
  }

  async disableCommentsReadOnlyMode() {
    await this.page.getByRole('button', { name: 'Unlock creation' }).click();
  }

  async filterComments(filter: string) {
    await this.page.getByTestId('comments-filter-button').click();
    await this.page.getByRole('menuitem', { name: filter }).click();
  }

  getComment(index: number): Locator {
    return this.page.getByTestId('comment-card').nth(index);
  }

  async sortComments(sorting: string) {
    await this.page.getByTestId('comments-sort-button').click();
    await this.page.getByRole('menuitem', { name: sorting }).click();
  }
}
