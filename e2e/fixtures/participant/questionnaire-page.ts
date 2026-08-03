import { Locator, Page } from '@playwright/test';

export class QuestionnairePage {
  private readonly submitButton: Locator;
  private readonly abstainButton: Locator;
  private readonly hintAfterAnswering: Locator;
  private readonly hintAfterContentStoppedWithoutAnswering: Locator;
  private readonly noContentsHint: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.abstainButton = page.getByRole('button', { name: 'Abstain' });
    this.hintAfterAnswering = page.getByText('You have answered.');
    this.hintAfterContentStoppedWithoutAnswering = page.getByText(
      "You didn't answer in time."
    );
    this.noContentsHint = page.getByText('No contents released.');
  }

  async goto(shortId: string, questionnaireId: string, contentId?: string) {
    const contentPath = contentId ? `/${contentId}` : '';
    await this.page.goto(
      `${this.baseURL}/p/${shortId}/questionnaire/${questionnaireId}${contentPath}`
    );
  }

  async answerContent(options: string[]) {
    for (const option of options) {
      await this.page.getByRole('radio', { name: option }).check();
    }
    await this.submitButton.click();
  }

  getContentBody(text: string): Locator {
    return this.page.getByText(text);
  }

  getSubmitButton(): Locator {
    return this.submitButton;
  }

  getAbstainButton(): Locator {
    return this.abstainButton;
  }

  getFirstRadioButton(): Locator {
    return this.page.getByRole('radio').first();
  }

  getHintAfterAnswering(): Locator {
    return this.hintAfterAnswering;
  }

  getHintAfterContentStoppedWithoutAnswering(): Locator {
    return this.hintAfterContentStoppedWithoutAnswering;
  }

  getNoContentsHint(): Locator {
    return this.noContentsHint;
  }

  getWaitingHint(current: number, totalCount: number): Locator {
    return this.page
      .getByTestId('content-step-info')
      .filter({ hasText: `Content${current}of${totalCount}` });
  }

  getContentListUpdatedHint(): Locator {
    return this.page.getByText('The content list has been updated.');
  }

  getContentListUpdatedAction(): Locator {
    return this.page.getByRole('button', { name: 'Load' });
  }

  getStepButtons(): Locator {
    return this.page.locator('.step-btn');
  }

  getStepButton(step: number): Locator {
    return this.getStepButtons().nth(step - 1);
  }

  async goToStep(step: number) {
    await this.getStepButton(step).click();
  }
}
