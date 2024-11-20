import { Locator, Page } from '@playwright/test';

export class Snackbar {
  private readonly snackBarContainer: Locator;

  constructor(public readonly page: Page) {
    this.snackBarContainer = this.page.locator('mat-snack-bar-container');
  }

  getSnackbar(): Locator {
    return this.snackBarContainer;
  }
}
