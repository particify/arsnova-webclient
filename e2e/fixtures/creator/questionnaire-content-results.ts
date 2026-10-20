import { Locator, Page } from '@playwright/test';

export class QuestionnaireContentResultsPage {
  constructor(public readonly page: Page) {}

  roundSelectorButton(): Locator {
    return this.page.getByRole('button', { name: /^Round/ });
  }

  async openRoundSelector() {
    await this.roundSelectorButton().click();
  }

  roundMenuItem(roundNo: number): Locator {
    return this.page.getByRole('menuitem', {
      name: `Round ${roundNo}`,
      exact: true,
    });
  }
}
