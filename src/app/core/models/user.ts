import { Person } from './person';

export class User {
  id: string;
  loginId: string;
  authProvider: string;
  revision: string;
  person: Person;
  account: UserAccount;

  constructor(
    id: string,
    loginId: string,
    authProvider: string,
    revision: string,
    person: Person,
    account: UserAccount = new UserAccount()
  ) {
    this.id = id;
    this.loginId = loginId;
    this.authProvider = authProvider;
    this.revision = revision;
    this.person = person;
    this.account = account;
  }
}

class UserAccount {
  activated = false;
  passwortResetTime?: Date;
}
