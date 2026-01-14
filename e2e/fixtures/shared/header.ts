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
    await this.page.waitForURL('user');
  }

  async goToLogin() {
    await this.openMainMenu();
    await this.page.getByRole('button', { name: 'log in' }).click();
  }

  async goToUserSettings() {
    await this.openMainMenu();
    await this.page.getByRole('button', { name: 'account settings' }).click();
  }

  async goToSettings(subroute?: string) {
    await this.page
      .getByRole('button', {
        name: 'room settings',
      })
      .click();
    if (subroute) {
      await this.page
        .getByRole('button', { name: subroute, exact: true })
        .click();
    }
  }

  async goToPresentation() {
    await this.page.getByRole('button', { name: 'present' }).click();
  }

  async switchRole() {
    const label = (await this.page
      .getByText('Preview', { exact: true })
      .isVisible())
      ? 'switch role'
      : 'switch back';
    await this.page
      .getByRole('button', {
        name: label,
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
