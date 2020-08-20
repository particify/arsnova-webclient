export class User {
  id: string;
  loginId: string;
  authProvider: string;

  constructor(id: string, loginId: string, authProvider: string) {
    this.id = id;
    this.loginId = loginId;
    this.authProvider = authProvider;
  }
}
