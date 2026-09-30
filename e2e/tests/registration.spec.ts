import { test, expect } from '@playwright/test';
import { RegistrationPage } from '@e2e/fixtures/shared/registration';
import { RoomListPage } from '@e2e/fixtures/shared/room-list';

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

  test('show an empty room list after registration', async ({ page }) => {
    const registration = new RegistrationPage(page);
    const roomList = new RoomListPage(page);
    // A unique address keeps this test independent of the one above and of
    // earlier runs against the same backend.
    await registration.register(
      `registration-${Date.now()}@test.de`,
      'Test1234?'
    );
    await registration.cancelVerification();
    await expect(roomList.getNoRoomsHint()).toBeVisible();
    await expect(roomList.getErrorMessage()).toBeHidden();
  });

  test('navigate to login', async ({ page }) => {
    await page.goto('register');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL('login');
  });
});
