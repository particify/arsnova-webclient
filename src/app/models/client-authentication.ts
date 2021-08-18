import { AuthProvider } from './auth-provider';

export class ClientAuthentication {
  userId: string;
  loginId: string;
  authProvider: AuthProvider;
  token: string;

  constructor(userId: string, loginId: string, authProvider: AuthProvider, token: string) {
    this.userId = userId;
    this.loginId = loginId;
    this.authProvider = authProvider;
    this.token = token;
  }
}

export class TransientClientAuthentication extends ClientAuthentication {
  constructor(auth: ClientAuthentication) {
    super(auth.userId, auth.loginId, auth.authProvider, auth.token);
  }
}
