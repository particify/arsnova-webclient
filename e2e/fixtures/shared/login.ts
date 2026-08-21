import { Locator, Page } from '@playwright/test';
import path from 'node:path';

export interface Account {
  loginId: string;
  password: string;
}

/**
 * Accounts seeded in the development backend. Unlike the guest account the app creates
 * implicitly, these are verified, which some features require.
 */
export const VERIFIED_ADMIN: Account = {
  loginId: 'admin@example.com',
  password: 'admin',
};
export const VERIFIED_USER: Account = {
  loginId: 'user@example.com',
  password: 'user',
};

/**
 * Session of VERIFIED_ADMIN, written once per run by the auth setup project. A spec opts into it
 * with test.use({ storageState: … }) and then runs as that account instead of a fresh guest, so
 * it must not be added to the shared use block: nearly every other spec needs to be a guest.
 */
export const VERIFIED_ADMIN_STORAGE_STATE = path.join(
  __dirname,
  '../../.auth/verified-admin.json'
);

export class LoginPage {
  private readonly loginIdInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(public readonly page: Page) {
    // Both labels depend on how many username/password providers the backend advertises: a single
    // one gives 'E-mail address' and 'Log in', additional ones (e.g. LDAP) switch to 'User ID' and
    // one 'Log in with <provider title>' button per provider.
    this.loginIdInput = page.getByLabel(/^(E-mail address|User ID)$/);
    this.passwordInput = page.getByLabel('Password', { exact: true });
    // Scoped to the form so the SSO buttons, which carry the same 'Log in with …' label, cannot
    // match. The first button belongs to the first provider the backend advertises, which is the
    // local one the accounts above live in.
    this.submitButton = page
      .locator('form', { has: this.passwordInput })
      .getByRole('button', { name: /^Log in( with .+)?$/ })
      .first();
  }

  async login(account: Account) {
    await this.page.goto('login');
    await this.loginIdInput.fill(account.loginId);
    await this.passwordInput.fill(account.password);
    await this.submitButton.click();
    await this.page.waitForURL('user');
  }
}
