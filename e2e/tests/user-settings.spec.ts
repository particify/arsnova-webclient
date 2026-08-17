import { Header } from '@e2e/fixtures/shared/header';
import { HomePage } from '@e2e/fixtures/shared/home';
import { LoginPage, VERIFIED_USER } from '@e2e/fixtures/shared/login';
import { UserProfilePage } from '@e2e/fixtures/shared/user-profile';
import { test, expect } from '@playwright/test';

// Every test here runs as the account it creates or logs into itself - one of them deletes that
// account, so this spec must never adopt a shared session.
test.describe('user settings', () => {
  test('display user id', async ({ page, baseURL }) => {
    await new LoginPage(page).login(VERIFIED_USER);
    const userProfile = new UserProfilePage(page, baseURL);
    const header = new Header(page);
    await header.goToUserSettings();
    await expect(page).toHaveURL('account');
    await expect(userProfile.getMailAddressSection()).toContainText(
      VERIFIED_USER.loginId
    );
  });

  test('delete guest account', async ({ page, baseURL }) => {
    const homePage = new HomePage(page, baseURL);
    await homePage.goto();
    await homePage.createRoom('My room');
    await page.waitForURL(/edit/);
    const userProfile = new UserProfilePage(page, baseURL);
    await userProfile.goto('delete-account');
    await userProfile.deleteAccount();
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
    await expect(page).toHaveURL('account');
    const userProfile = new UserProfilePage(page, baseURL);
    await userProfile.openDisplaySettings();
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
