import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 90000,
  forbidOnly: false,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    browserName: 'chromium',
    trace: 'on',
    permissions: ['clipboard-read'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
