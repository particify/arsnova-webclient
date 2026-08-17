import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 45000,
  expect: { timeout: 10000 },
  forbidOnly: false,
  retries: 1,
  // The dev server and the backend are single instances shared by every worker, so they - not
  // the test runner's own CPU use - are what bounds useful parallelism. An unset value would
  // take half of os.cpus(), which reports host CPUs and ignores the container's share.
  workers: 4,
  // The html reporter defaults to open: 'on-failure', which blocks the run on a report server.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Unset means no timeout at all: a click that can never succeed - the normal state of a
    // cleanup hook after its test failed - then consumes the entire hook budget instead.
    actionTimeout: 15000,
    baseURL: 'http://localhost:4200',
    browserName: 'chromium',
    navigationTimeout: 30000,
    permissions: ['clipboard-read'],
    // Recording for every test puts the trace flush into each test's teardown budget.
    trace: 'retain-on-failure',
  },
  projects: [
    // Provides a logged-in session for the specs that opt into it with test.use({ storageState }).
    // Deliberately not wired into the shared use block above: almost every spec has to run as a
    // fresh guest, and some of them delete everything the account they run as can see.
    {
      name: 'setup',
      testDir: './setup',
      // The default testMatch only picks up *.spec.ts/*.test.ts, so it would find nothing here.
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
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
