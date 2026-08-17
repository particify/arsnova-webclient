import { Locator, Page } from '@playwright/test';

export class ParticipantCommentsPage {
  private readonly commentSearchInput: Locator;
  private readonly openCreateDialogButton: Locator;
  private readonly commentBodyInput: Locator;
  private readonly submitCommentCreationButton: Locator;
  private readonly sortSelect: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.openCreateDialogButton = page.getByText('write a post').first();
    this.commentSearchInput = page.getByPlaceholder('search');
    this.commentBodyInput = page.getByLabel('your post');
    this.submitCommentCreationButton = page.getByRole('button', {
      name: 'send',
    });
    this.sortSelect = page.getByRole('combobox');
  }

  async goto(shortId: string) {
    await this.page.goto(`${this.baseURL}/p/${shortId}/comments`);
  }

  getSearchInput(): Locator {
    return this.commentSearchInput;
  }

  async createPost(body: string) {
    await this.openCreateDialogButton.click();
    await this.commentBodyInput.fill(body);
    await this.submitCommentCreationButton.click();
    await this.commentBodyInput.waitFor({ state: 'detached' });
    await this.submitCommentCreationButton.waitFor({ state: 'detached' });
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

  async setSorting(index: number) {
    await this.sortSelect.click();
    await this.page.getByRole('option').nth(index).click();
  }

  async voteUpPost(body: string) {
    await this.getPost(body).getByRole('button', { name: 'vote up' }).click();
  }

  async voteDownPost(body: string) {
    await this.getPost(body).getByRole('button', { name: 'vote down' }).click();
  }
}
