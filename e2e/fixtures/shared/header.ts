import { Page } from '@playwright/test';

export const BASE_URL = 'http://localhost:4200';

export class Header {
  constructor(public readonly page: Page) {}

  async openMainMenu() {
    await this.page.getByTestId('main-menu-button').click();
  }

  async goToRooms() {
    await this.openMainMenu();
    await this.page.getByRole('button', { name: 'my rooms' }).click();
  }

  async goToLogin() {
    await this.openMainMenu();
    await this.page.getByRole('button', { name: 'log in' }).click();
  }

  async goToSettings() {
    await this.page
      .getByRole('button', {
        name: 'room settings',
      })
      .click();
  }

  async goToPresentation() {
    await this.page.getByRole('button', { name: 'present' }).click();
  }

  async switchRole() {
    await this.page
      .getByRole('button', {
        name: 'switch back',
      })
      .click();
  }

  async changeLanguage(lang: string) {
    await this.page.getByTestId('language-button').click();
    await this.page
      .getByRole('menuitem', {
        name: lang,
      })
      .click();
  }
}
