import { test, expect } from '@playwright/test';

test.describe('registration', () => {
  test('register via direct entry', async ({ page }) => {
    await page.goto('register');
    await expect(page.getByText('Create your ARSnova account')).toBeVisible();
    await page.getByLabel('E-mail address').fill('test@test.de');
    await page.getByLabel('New password').fill('Test1234?');
    await expect(page.getByLabel('New password')).toHaveAttribute(
      'type',
      'password'
    );
    await page.getByTestId('toggle-password-visibility-btn').click();
    await expect(page.getByLabel('New password')).toHaveAttribute(
      'type',
      'text'
    );
    await page.getByRole('checkbox', { name: 'terms of use' }).click();
    await page.getByRole('button', { name: 'register' }).click();
    await expect(page).toHaveURL('user');
    await expect(page.getByLabel('verification code')).toBeVisible();
    await page.getByRole('button', { name: 'cancel' }).click();
    await expect(page.getByLabel('verification code')).toBeHidden();
    await expect(page.getByText('verify your e-mail address')).toBeVisible();
    await page.getByRole('button', { name: 'verify e-mail' }).click();
    await expect(page.getByLabel('verification code')).toBeVisible();
  });

  test('navigate to login', async ({ page }) => {
    await page.goto('register');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL('login');
  });
});
