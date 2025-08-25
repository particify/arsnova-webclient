import { Locator, Page } from '@playwright/test';

export class ContentGroupOverviewPage {
  private readonly createContentButton: Locator;
  private readonly publishContentGroupButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.createContentButton = page.getByRole('button', {
      name: 'Create content',
    });
    this.publishContentGroupButton = page.getByRole('button', {
      name: 'Publish',
      exact: true,
    });
  }

  async goto(shortId: string, seriesName: string) {
    await this.page.goto(
      `${this.baseURL}/edit/${shortId}/series/${seriesName}`
    );
  }

  async createContent() {
    await this.createContentButton.click();
  }

  async getContents() {
    await this.page.getByRole('group').waitFor();
    return await this.page.getByTestId('content-item').all();
  }

  async publishContentGroup() {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/contentgroup/') &&
          res.ok() &&
          res.request().method() === 'PATCH'
      ),
      await this.publishContentGroupButton.click(),
    ]);
  }

  async togglePublishingContentGroup() {
    await this.openSettings();
    await this.page.getByLabel('published question series').click();
    await this.saveSettings();
  }

  async toggleLiveMode() {
    await this.openSettings();
    await this.page.getByLabel('contents are presented live').click();
    await this.saveSettings();
  }

  async usePublishingModeRange() {
    await this.openSettings();
    await this.page.getByRole('radio', { name: 'range' }).click();
    await this.saveSettings();
  }

  async toggleLeaderboard() {
    await this.openSettings();
    await this.page.getByLabel('leaderboard').click();
    await this.saveSettings();
  }

  async togglePublishCorrect() {
    await this.openSettings();
    const isLeaderboardEnabled = await this.page
      .getByLabel('leaderboard')
      .isChecked();
    if (isLeaderboardEnabled) {
      await this.page.getByLabel('leaderboard').click();
    }
    await this.page.getByLabel('correct answers').click();
    await this.saveSettings();
  }

  async saveSettings() {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/contentgroup/') &&
          res.ok() &&
          res.request().method() === 'PATCH'
      ),
      await this.page.getByRole('button', { name: 'save' }).click(),
    ]);
  }

  async openSettings() {
    await this.page.getByTestId('content-group-settings').click();
  }

  async startContent(body: string, i: number) {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/start') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      await this.hoverContent(body),
      await this.page.getByTestId('start-content-' + i).click(),
    ]);
  }

  async stopContent(i: number) {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/stop') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      await this.page.getByTestId('stop-content-' + i).click(),
    ]);
  }

  async duplicateContent(body: string, i: number) {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/duplicate') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      await this.hoverContent(body),
      await this.page.getByTestId('open-more-options-' + i).click(),
      await this.page.getByText('Duplicate').click(),
    ]);
  }

  async hoverContent(body: string) {
    await this.page.getByRole('button', { name: body }).hover();
  }

  async openMoreMenu(i: number) {
    await this.page.getByTestId('open-more-options-' + i).click();
  }

  async createNewContentGroup(group: string, typeIcon: string) {
    await this.page.getByText('New question series').click();
    await this.page.getByLabel('name of the question series').fill(group);
    await this.page.getByLabel(typeIcon).click();
    await this.page
      .getByRole('button', {
        name: 'create',
      })
      .click();
  }

  async copyContentToNewGroup(
    body: string,
    i: number,
    group: string,
    groupIcon: string
  ) {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/duplicate') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      await this.hoverContent(body),
      await this.openMoreMenu(i),
      await this.page.getByRole('menuitem', { name: 'Copy' }).click(),
      await this.createNewContentGroup(group, groupIcon),
    ]);
  }

  async moveContentToNewGroup(
    body: string,
    i: number,
    group: string,
    groupIcon: string
  ) {
    await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/duplicate') &&
          res.ok() &&
          res.request().method() === 'POST'
      ),
      this.page.waitForResponse(
        (res) =>
          res.url().includes('/content') &&
          res.ok() &&
          res.request().method() === 'DELETE'
      ),
      await this.hoverContent(body),
      await this.openMoreMenu(i),
      await this.page.getByRole('menuitem', { name: 'Move' }).click(),
      await this.createNewContentGroup(group, groupIcon),
    ]);
  }

  async openGroupMoreMenu() {
    await this.page.getByTestId('group-more-menu').click();
  }

  async deleteGroup(confirm = false) {
    await this.openGroupMoreMenu();
    await this.page
      .getByRole('menuitem', { name: 'delete question series' })
      .click();
    if (confirm) {
      await Promise.all([
        this.page.waitForResponse(
          (res) =>
            res.url().includes('/contentgroup/') &&
            res.ok() &&
            res.request().method() === 'DELETE'
        ),
        await this.page.getByRole('button', { name: 'delete' }).click(),
      ]);
    } else {
      await this.page.getByTestId('dialog-abort-button').click();
    }
  }
}
