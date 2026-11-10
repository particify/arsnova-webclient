import { Locator, Page, expect } from '@playwright/test';

/** The Team tab of the share menu and the member settings dialog it opens. */
export class MemberSettings {
  readonly menu: Locator;
  readonly dialog: Locator;

  constructor(public readonly page: Page) {
    this.menu = page.locator('.mat-mdc-menu-panel');
    this.dialog = page.locator('app-member-settings-dialog');
  }

  async openTeamTab() {
    await this.page.getByRole('button', { name: 'Share', exact: true }).click();
    await this.menu.getByRole('tab', { name: 'Team' }).click();
  }

  async open() {
    await this.openTeamTab();
    await this.menu.getByTestId('member-settings-button').click();
  }

  /**
   * Adds an existing account with the given role, by default a moderator. Works with login IDs
   * and with mail addresses alike, since an account found by either is added right away.
   */
  async addMember(loginId: string, role?: string) {
    await this.chooseRole(role);
    await this.dialog.getByTestId('team-login-id').fill(loginId);
    await Promise.all([
      this.waitForOperation('GrantRoomRole'),
      this.submitButton().click(),
    ]);
  }

  /** Invites a mail address without an account; only offered where login IDs are mail addresses. */
  async inviteByMail(mailAddress: string, role?: string) {
    await this.chooseRole(role);
    await this.dialog.getByTestId('team-login-id').fill(mailAddress);
    await expect(this.submitButton()).toHaveText(/Invite/);
    await Promise.all([
      this.waitForOperation('GrantRoomRoleByInvitation'),
      this.submitButton().click(),
    ]);
  }

  /** Whether login IDs are mail addresses here, which the invite field is labelled after. */
  async loginIdIsEmail(): Promise<boolean> {
    return (
      (await this.dialog.getByLabel('E-mail', { exact: true }).count()) > 0
    );
  }

  private async chooseRole(role?: string) {
    if (role) {
      await this.dialog.getByTestId('invite-role-select').click();
      await this.roleOption(role).click();
    }
  }

  private waitForOperation(operationName: string) {
    return this.page.waitForResponse(
      (res) =>
        !!res
          .request()
          .postData()
          ?.includes(`"operationName":"${operationName}"`) && res.ok()
    );
  }

  /** A member listed in the given scope, the share menu or the dialog. */
  member(scope: Locator, loginId: string): Locator {
    return scope.getByTestId('team-member').filter({ hasText: loginId });
  }

  /** Labelled "Invite" where login IDs are mail addresses, "Add" otherwise. */
  private submitButton(): Locator {
    return this.dialog.getByTestId('invite-submit-button');
  }

  /** A role in the open role select, named by its title. */
  private roleOption(role: string): Locator {
    return this.page
      .locator('.role-select-panel')
      .getByRole('option')
      .filter({ has: this.page.getByText(role, { exact: true }) });
  }

  async changeRole(loginId: string, role: string) {
    await this.member(this.dialog, loginId)
      .getByTestId('member-role-select')
      .click();
    await Promise.all([
      this.waitForOperation('GrantRoomRole'),
      this.roleOption(role).click(),
    ]);
  }

  async removeMember(loginId: string) {
    await this.member(this.dialog, loginId)
      .getByTestId('member-role-select')
      .click();
    await this.page
      .getByRole('option', { name: `Remove ${loginId}`, exact: true })
      .click();
    await Promise.all([
      this.waitForOperation('RevokeRoomRole'),
      this.page.getByRole('button', { name: 'Remove', exact: true }).click(),
    ]);
  }
}
