import { AuthProvider } from './auth-provider';

export class AuthenticatedUser {
  userId: string;
  displayId?: string;
  displayName?: string;
  loginId: string;
  authProvider: AuthProvider;

  constructor(userId: string, loginId: string, authProvider: AuthProvider) {
    this.userId = userId;
    this.loginId = loginId;
    this.authProvider = authProvider;
  }
}
