import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test('login via direct entry', async ({ page }) => {
    await page.goto('login');
    await expect(page.getByText('welcome back')).toBeVisible();
    await page
      .getByLabel('E-mail address', { exact: true })
      .fill('user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('user');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL('user');
    await expect(page.getByText('U', { exact: true })).toBeVisible();
  });

  test('go to password reset', async ({ page }) => {
    await page.goto('login');
    await page
      .getByLabel('E-mail address', { exact: true })
      .fill('user@example.com');
    await page
      .getByRole('button', { name: 'Forgot your password?', exact: true })
      .click();
    await expect(page).toHaveURL('request-password-reset');
    await page.getByRole('button', { name: 'Reset password' }).click();
    await expect(page).toHaveURL('password-reset/user@example.com');
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('go to registration', async ({ page }) => {
    await page.goto('login');
    await page.getByRole('button', { name: 'Register', exact: true }).click();
    await expect(page).toHaveURL('register');
  });
});
