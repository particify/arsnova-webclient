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

  async getSearchPlaceholder(): Promise<string | null> {
    return await this.commentSearchInput.getAttribute('placeholder');
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

  getSecondaryCreateButton(): Locator {
    return this.page.getByText('write a post').nth(1);
  }

  async getSortSelect(): Promise<string | null> {
    return await this.sortSelect.textContent();
  }

  async setSorting(index: number) {
    await this.sortSelect.click();
    await this.page.getByRole('option').nth(index).click();
  }

  async voteUp(index: number) {
    await this.page.getByRole('button', { name: 'vote up' }).nth(index).click();
  }

  async voteDown(index: number) {
    await this.page
      .getByRole('button', { name: 'vote down' })
      .nth(index)
      .click();
  }
}
