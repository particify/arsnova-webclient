export class AuthenticatedUser {
  userId: string;
  verified: boolean;
  displayId?: string;
  displayName?: string;
  unverifiedMailAddress?: string;
  language?: string;

  constructor(
    userId: string,
    verified: boolean,
    displayId: string | undefined,
    displayName?: string,
    unverifiedMailAddress?: string,
    language?: string
  ) {
    this.userId = userId;
    this.verified = verified;
    this.displayId = displayId;
    this.displayName = displayName;
    this.unverifiedMailAddress = unverifiedMailAddress;
    this.language = language;
  }
}
