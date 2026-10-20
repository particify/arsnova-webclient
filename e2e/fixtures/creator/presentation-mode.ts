import { expect, Locator, Page } from '@playwright/test';
import { waitForOperation } from '@e2e/fixtures/shared/graphql';

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
    const viewport = this.page.viewportSize();
    await this.page.mouse.move(
      (viewport?.width ?? 1000) / 2,
      (viewport?.height ?? 500) - 50
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
      waitForOperation(this.page, 'UpdateQuestionnaire'),
      this.page.getByRole('button', { name: 'Publish' }).click(),
    ]);
  }

  async startContent() {
    await this.hoverControlBar();
    await Promise.all([
      waitForOperation(this.page, 'StartQuestionnaireContent'),
      this.page
        .getByRole('button', { name: 'start the content' })
        .first()
        .click(),
    ]);
  }

  async stopContent() {
    await this.hoverControlBar();
    await Promise.all([
      waitForOperation(this.page, 'StopQuestionnaireContent'),
      this.page
        .getByRole('button', { name: 'stop the content' })
        .first()
        .click(),
    ]);
  }

  async publishContent() {
    // The action button fades in and out with the control bar; its hotkey does not.
    await this.page.keyboard.press('p');
  }

  async openContentMoreMenu() {
    // The control bar slides out of view unless hovered, so the menu is opened
    // with its hotkey. Until the presented content has loaded, it opens an
    // empty placeholder; retry until a real menu item shows.
    const firstItem = this.page.getByRole('menuitem').first();
    await expect(async () => {
      // Escape would leave the presentation, so the menu is only toggled open.
      if (!(await firstItem.isVisible())) {
        await this.page.keyboard.press('m');
      }
      await expect(firstItem).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
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
      waitForOperation(this.page, 'DeleteQuestionnaireAnswersByContentId'),
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

  async startComments() {
    await this.page.getByRole('button', { name: 'Start Q&A' }).click();
  }

  async filterComments(filter: string) {
    await this.page.getByTestId('comments-filter-button').click();
    await this.page.getByRole('menuitem', { name: filter }).click();
  }

  getComment(index: number): Locator {
    return this.page.getByTestId('comment-card').nth(index);
  }

  /**
   * Addresses a post in the list by its body. Locating it on the page instead would be ambiguous:
   * the post being presented is rendered a second time, outside the list.
   */
  getPost(body: string): Locator {
    return this.page.getByTestId('comment-card').filter({ hasText: body });
  }

  async sortComments(sorting: string) {
    await this.page.getByTestId('comments-sort-button').click();
    await this.page.getByRole('menuitem', { name: sorting }).click();
  }
}
