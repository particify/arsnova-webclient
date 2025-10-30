export class AuthenticatedUser {
  userId: string;
  verified: boolean;
  displayId?: string;
  displayName?: string;

  constructor(
    userId: string,
    verified: boolean,
    displayId: string | undefined,
    displayName?: string
  ) {
    this.userId = userId;
    this.verified = verified;
    this.displayId = displayId;
    this.displayName = displayName;
  }
}
