import { Download, expect, Locator, Page } from '@playwright/test';
import { waitForOperation } from '@e2e/fixtures/shared/graphql';

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

  getContents(): Locator {
    return this.page.getByTestId('content-item');
  }

  async publishContentGroup() {
    await Promise.all([
      waitForOperation(this.page, 'ToggleQuestionnairePublished'),
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

  /**
   * Moves the end of the published range down by the given number of
   * contents, with the keyboard, as its divider is dragged otherwise. The
   * range starts at the first content.
   */
  async extendPublishedRange(contentCount: number) {
    // Closing the settings dialog hands the focus back to its trigger.
    await expect(this.page.getByRole('dialog')).toBeHidden();
    const divider = this.page.getByLabel(/^Published up to the content \d+\./);
    for (let end = 1; end <= contentCount; end++) {
      await expect(divider).toHaveAttribute(
        'aria-label',
        new RegExp(`content ${end}\\.`)
      );
      await divider.focus();
      await Promise.all([
        waitForOperation(this.page, 'PublishQuestionnaireUpToContent'),
        this.page.keyboard.press('Control+ArrowDown'),
      ]);
    }
    await expect(divider).toHaveAttribute(
      'aria-label',
      new RegExp(`content ${contentCount + 1}\\.`)
    );
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
      waitForOperation(this.page, 'UpdateQuestionnaire'),
      await this.page.getByRole('button', { name: 'save' }).click(),
    ]);
  }

  /**
   * Sets the given question series settings in one save, leaving the others
   * as they are. Labels match the switches' visible text.
   */
  async configure(settings: {
    liveMode?: boolean;
    leaderboard?: boolean;
    statistics?: boolean;
    correctAnswers?: boolean;
    publishingMode?: 'All' | 'Range';
  }) {
    const labels: [keyof typeof settings, string][] = [
      ['liveMode', 'contents are presented live'],
      ['leaderboard', 'leaderboard'],
      ['statistics', 'publish statistics'],
      ['correctAnswers', 'correct answers'],
    ];
    await this.openSettings();
    for (const [key, label] of labels) {
      const value = settings[key];
      if (value !== undefined) {
        await this.page.getByRole('switch', { name: label }).setChecked(value);
      }
    }
    if (settings.publishingMode) {
      await this.page
        .getByRole('radio', { name: settings.publishingMode, exact: true })
        .check();
    }
    await this.saveSettings();
  }

  async openSettings() {
    await this.page.getByTestId('content-group-settings').click();
  }

  async startContent(body: string, i: number) {
    await Promise.all([
      waitForOperation(this.page, 'StartQuestionnaireContent'),
      await this.hoverContent(body),
      await this.page.getByTestId('start-content-' + i).click(),
    ]);
  }

  async stopContent(i: number) {
    await Promise.all([
      waitForOperation(this.page, 'StopQuestionnaireContent'),
      await this.page.getByTestId('stop-content-' + i).click(),
    ]);
  }

  async duplicateContent(body: string, i: number) {
    await Promise.all([
      waitForOperation(this.page, 'DuplicateQuestionnaireContent'),
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
      waitForOperation(this.page, 'CopyQuestionnaireContentToQuestionnaire'),
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
      waitForOperation(this.page, 'MoveQuestionnaireContentToQuestionnaire'),
      await this.hoverContent(body),
      await this.openMoreMenu(i),
      await this.page.getByRole('menuitem', { name: 'Move' }).click(),
      await this.createNewContentGroup(group, groupIcon),
    ]);
  }

  async openGroupMoreMenu() {
    await this.page.getByTestId('group-more-menu').click();
  }

  async resetResults() {
    await this.openGroupMoreMenu();
    await this.page.getByRole('menuitem', { name: 'Reset results' }).click();
    await Promise.all([
      waitForOperation(this.page, 'ResetQuestionnaireResults'),
      this.page.getByRole('button', { name: 'Delete' }).click(),
    ]);
  }

  /** Exports the contents with the dialog's defaults, CSV in UTF-8. */
  async exportContents(): Promise<Download> {
    await this.openGroupMoreMenu();
    await this.page.getByRole('menuitem', { name: 'Export' }).click();
    await this.page.getByRole('menuitem', { name: 'Export series' }).click();
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);
    return download;
  }

  async importContents(file: string) {
    await this.openGroupMoreMenu();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByRole('menuitem', { name: 'Import contents' }).click(),
    ]);
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/contents-import') && res.ok()
      ),
      fileChooser.setFiles(file),
    ]);
  }

  async deleteGroup(confirm = false) {
    await this.openGroupMoreMenu();
    await this.page
      .getByRole('menuitem', { name: 'delete question series' })
      .click();
    if (confirm) {
      await Promise.all([
        waitForOperation(this.page, 'DeleteQuestionnaire'),
        await this.page.getByRole('button', { name: 'delete' }).click(),
      ]);
    } else {
      await this.page.getByTestId('dialog-abort-button').click();
    }
  }
}
