import { Locator, Page } from '@playwright/test';

export class CreatorCommentsPage {
  private readonly commentSearchInput: Locator;
  private readonly commentBodyInput: Locator;
  private readonly submitCommentCreationButton: Locator;
  private readonly sortSelect: Locator;
  private readonly readonlyToggleButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.commentSearchInput = page.getByPlaceholder('search');
    this.commentBodyInput = page.getByLabel('your post');
    this.submitCommentCreationButton = page.getByRole('button', {
      name: 'send',
    });
    this.sortSelect = page.getByRole('combobox');
    this.readonlyToggleButton = page.getByTestId('toggle-readonly-button');
  }

  async goto(shortId: string) {
    await this.page.goto(`${this.baseURL}/edit/${shortId}/comments`);
  }

  async createPost(body: string) {
    await this.openCommentsMoreMenu();
    await this.page.getByRole('menuitem', { name: 'write a post' }).click();
    await this.commentBodyInput.fill(body);
    await this.submitCommentCreationButton.click();
    await this.commentBodyInput.waitFor({ state: 'detached' });
    await this.submitCommentCreationButton.waitFor({ state: 'detached' });
  }

  async openCommentsMoreMenu() {
    await this.page.getByTestId('comments-more-menu-button').click();
  }

  getComment(index: number): Locator {
    return this.page.getByTestId('comment-card').nth(index);
  }

  /**
   * Addresses a post by its body rather than by list position. The list re-sorts and updates live,
   * so an index taken right after creating or voting on a post can refer to a different one.
   */
  getPost(body: string): Locator {
    return this.page.getByTestId('comment-card').filter({ hasText: body });
  }

  getSecondaryCreateButton(): Locator {
    return this.page.getByText('write a post').nth(1);
  }

  getSortSelect(): Locator {
    return this.sortSelect;
  }

  getSearchInput(): Locator {
    return this.commentSearchInput;
  }

  async setSorting(index: number) {
    await this.sortSelect.click();
    await this.page.getByRole('option').nth(index).click();
  }

  async toggleReadonly() {
    await this.readonlyToggleButton.click();
  }

  async startComments() {
    await this.page.getByRole('button', { name: 'Start Q&A' }).click();
  }

  async openMoreMenu(commentIndex: number) {
    await this.page
      .getByTestId('comment-more-menu-button')
      .nth(commentIndex)
      .click();
  }

  async openMoreMenuForPost(body: string) {
    await this.getPost(body).getByTestId('comment-more-menu-button').click();
  }

  async performMoreMenuAction(action: string) {
    await this.page
      .getByRole('menuitem', {
        name: action,
      })
      .click();
  }

  async filterComments(filter: string) {
    await this.page.getByTestId('comments-filter-button').click();
    await this.page.getByRole('menuitem', { name: filter }).click();
  }

  async searchComments(search: string) {
    await this.page.getByPlaceholder('search').fill(search);
  }

  async switchToModeration() {
    await this.page.getByRole('tab', { name: 'Moderation' }).click();
  }

  getNoCommentsHint() {
    return this.page.getByText('no posts present');
  }

  async releaseComment(index: number) {
    await this.page.getByTestId('release-comment-button').nth(index).click();
  }
}
