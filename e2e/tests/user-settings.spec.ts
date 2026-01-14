import { Header } from '@e2e/fixtures/shared/header';
import { HomePage } from '@e2e/fixtures/shared/home';
import { test, expect } from '@playwright/test';

test.describe('user settings', () => {
  test('display user id', async ({ page }) => {
    await page.goto('login');
    await page
      .getByLabel('E-mail address', { exact: true })
      .fill('user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('user');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('user');
    const header = new Header(page);
    await header.goToUserSettings();
    await expect(page).toHaveURL('account/user');
    await expect(page.getByText('User ID: user@example.com')).toBeVisible();
  });

  test('delete guest account', async ({ page, baseURL }) => {
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    const header = new Header(page);
    await header.goToUserSettings();
    await page.waitForURL('account/user');
    await page.getByRole('button', { name: 'Delete account' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForResponse(
      (res) => !!res.request().postData()?.includes('DeleteUser') && res.ok()
    );
    await expect(page).toHaveURL('');
  });

  test('change display settings', async ({ page, baseURL }) => {
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    const header = new Header(page);
    await header.goToUserSettings();
    await page.waitForURL('account/user');
    await page.getByRole('button', { name: 'display settings' }).click();
    await expect(page).toHaveURL('account/preferences');
    await page
      .getByRole('switch', {
        name: 'show results in percent',
      })
      .setChecked(false);
    await page
      .getByRole('switch', {
        name: 'show results directly',
      })
      .setChecked(true);
    await page.reload();
    await expect(
      page.getByRole('switch', {
        name: 'show results in percent',
      })
    ).not.toBeChecked();
    await expect(
      page.getByRole('switch', {
        name: 'show results directly',
      })
    ).toBeChecked();
  });
});
