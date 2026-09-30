import { Locator, Page } from '@playwright/test';

export class RegistrationPage {
  private readonly mailAddressInput: Locator;
  private readonly passwordInput: Locator;
  private readonly termsCheckbox: Locator;
  private readonly registerButton: Locator;
  private readonly cancelVerificationButton: Locator;

  constructor(public readonly page: Page) {
    this.mailAddressInput = page.getByLabel('E-mail address');
    this.passwordInput = page.getByLabel('New password');
    this.termsCheckbox = page.getByRole('checkbox', { name: 'terms of use' });
    this.registerButton = page.getByRole('button', { name: 'register' });
    this.cancelVerificationButton = page.getByRole('button', {
      name: 'cancel',
    });
  }

  /**
   * Registers a new account and lands on the user's room list, where the
   * verification dialog opens.
   */
  async register(mailAddress: string, password: string) {
    await this.page.goto('register');
    await this.mailAddressInput.fill(mailAddress);
    await this.passwordInput.fill(password);
    await this.termsCheckbox.click();
    await this.registerButton.click();
    await this.page.waitForURL('user');
  }

  async cancelVerification() {
    await this.cancelVerificationButton.click();
  }
}
