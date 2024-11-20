import { Locator, Page } from '@playwright/test';

export const BASE_URL = 'http://localhost:4200';

export class Header {
  private readonly menuButton: Locator;
  private readonly roomsButton: Locator;
  private readonly roomSettingsButton: Locator;
  private readonly returnToEditViewButton: Locator;

  constructor(public readonly page: Page) {
    this.menuButton = page.locator('menu-button');
    this.roomsButton = page.getByRole('button', { name: 'my rooms' });
    this.roomSettingsButton = page.getByRole('button', {
      name: 'room settings',
    });
    this.returnToEditViewButton = page.getByRole('button', {
      name: 'switch back',
    });
  }

  async openMainMenu() {
    await this.menuButton.click();
  }

  async goToRooms() {
    await this.openMainMenu();
    await this.roomsButton.click();
  }

  async goToSettings() {
    await this.roomSettingsButton.click();
  }

  async switchRole() {
    await this.returnToEditViewButton.click();
  }
}
