import { Locator, Page } from '@playwright/test';

export class RoomListPage {
  private readonly noRoomsHint: Locator;
  private readonly errorMessage: Locator;

  constructor(public readonly page: Page) {
    this.noRoomsHint = page.getByText("You haven't created any rooms yet.");
    // The room list shows this hard-coded, unlocalized text if its query fails.
    this.errorMessage = page.getByText('Error', { exact: true });
  }

  getNoRoomsHint(): Locator {
    return this.noRoomsHint;
  }

  getErrorMessage(): Locator {
    return this.errorMessage;
  }
}
