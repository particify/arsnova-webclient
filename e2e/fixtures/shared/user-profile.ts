import { Locator, Page } from '@playwright/test';

/**
 * Account settings page. Its sections are collapsible panels which all start collapsed, so the
 * page itself is `account` and a section name is only appended once one is opened - either by
 * expanding it or by linking straight to it.
 */
export class UserProfilePage {
  private readonly mailAddressSection: Locator;
  private readonly displaySettingsSection: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly confirmDeleteAccountButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.mailAddressSection = page.getByRole('button', {
      name: 'Your e-mail address is',
    });
    this.displaySettingsSection = page.getByRole('button', {
      name: 'display settings',
    });
    // The section header carries the same text, so only an exact match hits the button itself.
    this.deleteAccountButton = page.getByRole('button', {
      name: 'Delete account',
      exact: true,
    });
    this.confirmDeleteAccountButton = page.getByRole('button', {
      name: 'Delete',
      exact: true,
    });
  }

  async goto(section?: string) {
    await this.page.goto(
      `${this.baseURL}/account` + (section ? `/${section}` : '')
    );
  }

  getMailAddressSection(): Locator {
    return this.mailAddressSection;
  }

  async openDisplaySettings() {
    await this.displaySettingsSection.click();
  }

  async deleteAccount() {
    await this.deleteAccountButton.click();
    await this.confirmDeleteAccountButton.click();
  }
}
