import { test as setup } from '@playwright/test';
import {
  LoginPage,
  VERIFIED_ADMIN,
  VERIFIED_ADMIN_STORAGE_STATE,
} from '@e2e/fixtures/shared/login';

/*
 * Runs once per run, before the chromium project, so that specs which need a verified account
 * reuse a single session instead of logging in per test. The seeded accounts are shared, and four
 * workers logging into the same one at the same moment makes POST /api/auth/login return a 500.
 */
setup('authenticate as verified admin', async ({ page }) => {
  await new LoginPage(page).login(VERIFIED_ADMIN);
  await page.context().storageState({ path: VERIFIED_ADMIN_STORAGE_STATE });
});
