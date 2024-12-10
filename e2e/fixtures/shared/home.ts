import { Room } from '@app/core/models/room';
import { Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly joinButton: Locator;
  private readonly joinInput: Locator;
  private readonly openCreateDialogButton: Locator;
  private readonly roomNameInput: Locator;
  private readonly submitRoomCreationButton: Locator;

  constructor(
    public readonly page: Page,
    private readonly baseURL: string | undefined
  ) {
    this.joinButton = page.locator('id=join-button');
    this.joinInput = page.getByPlaceholder(/1122/);
    this.openCreateDialogButton = page.getByRole('button', {
      name: 'create room',
    });
    this.roomNameInput = page.getByRole('combobox', { name: 'room name' });
    this.submitRoomCreationButton = page.getByRole('button', {
      name: 'create room',
    });
  }

  async goto() {
    if (this.baseURL) {
      await this.page.goto(this.baseURL);
    }
  }

  async joinRoom(shortId: string) {
    await this.joinInput.fill(shortId);
    await this.joinButton.click();
  }

  async createRoom(roomName: string): Promise<string> {
    await this.openCreateDialogButton.click();
    await this.roomNameInput.fill(roomName);
    // Workaround for blocking LMS extension
    await this.page.waitForTimeout(500);
    const response$ = this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/room/') &&
        res.status() === 201 &&
        res.request().method() === 'POST'
    );
    await this.submitRoomCreationButton.click();
    return ((await (await response$).json()) as Room).shortId;
  }
}
