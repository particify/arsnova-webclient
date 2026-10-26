import { Locator, Page } from '@playwright/test';

export class QuestionnaireContentListPage {
  constructor(public readonly page: Page) {}

  contentItem(i: number): Locator {
    return this.page.getByTestId('content-item').nth(i);
  }

  startButton(i: number): Locator {
    return this.page.getByTestId(`start-content-${i}`);
  }

  stopButton(i: number): Locator {
    return this.page.getByTestId(`stop-content-${i}`);
  }

  async openMoreMenu(i: number) {
    await this.contentItem(i).hover();
    await this.page.getByTestId(`open-more-options-${i}`).click();
  }

  startNewRoundMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Start new round' });
  }

  deleteAnswersMenuItem(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete answers' });
  }

  async startContent(i: number) {
    await this.contentItem(i).hover();
    await this.startButton(i).click();
  }

  async stopContent(i: number) {
    await this.contentItem(i).hover();
    await this.stopButton(i).click();
  }

  async startNewRound(i: number) {
    await this.openMoreMenu(i);
    await this.startNewRoundMenuItem().click();
    await this.page.getByRole('button', { name: 'Start', exact: true }).click();
  }

  async publishTextAnswers(i: number) {
    // The content actions only show while the content is hovered.
    await this.contentItem(i).hover();
    await this.contentItem(i)
      .getByRole('button', { name: 'Publish answers' })
      .click();
  }

  finishedBadge(i: number): Locator {
    return this.contentItem(i).getByText('Finished').first();
  }

  async openSettings() {
    await this.page.getByTestId('content-group-settings').click();
  }

  async toggleLiveMode() {
    await this.openSettings();
    await this.page.getByLabel('Live mode').click();
    await this.saveSettings();
  }

  async saveSettings() {
    await this.page.getByRole('button', { name: 'save' }).click();
  }
}
