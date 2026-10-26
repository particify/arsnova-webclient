import { ConsoleMessage, Page } from '@playwright/test';

declare global {
  interface Window {
    e2eRecordSnackbar?: (text: string) => Promise<void>;
    e2eWatchingSnackbars?: boolean;
  }
}

/**
 * Records what a page reports as going wrong over a stretch of a test, across
 * navigations: the errors it logs and the text of every snackbar it shows. A
 * snackbar is gone again after a few seconds, so asserting on one only at the
 * end of a test would miss it.
 */
export class PageProblems {
  private readonly consoleErrors: string[] = [];
  private readonly snackbars: string[] = [];

  private constructor() {}

  static async record(page: Page): Promise<PageProblems> {
    const problems = new PageProblems();
    page.on('console', (message: ConsoleMessage) => {
      if (message.type() === 'error') {
        problems.consoleErrors.push(message.text());
      }
    });
    await page.exposeFunction('e2eRecordSnackbar', (text: string) => {
      problems.snackbars.push(text);
    });
    const watchSnackbars = () => {
      if (window.e2eWatchingSnackbars) {
        return;
      }
      window.e2eWatchingSnackbars = true;
      const seen = new WeakSet<Element>();
      setInterval(() => {
        document.querySelectorAll('mat-snack-bar-container').forEach((bar) => {
          const text = bar.textContent?.trim();
          if (text && !seen.has(bar)) {
            seen.add(bar);
            window.e2eRecordSnackbar?.(text);
          }
        });
      }, 50);
    };
    await page.addInitScript(watchSnackbars);
    await page.evaluate(watchSnackbars);
    return problems;
  }

  /** The errors logged so far, only those mentioning the text if one is given. */
  errors(containing?: string): string[] {
    return this.consoleErrors.filter(
      (error) => !containing || error.includes(containing)
    );
  }

  /** The text of every snackbar shown so far. */
  snackbarTexts(): string[] {
    return [...this.snackbars];
  }
}
