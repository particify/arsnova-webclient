import { Person } from './person';

export class User {
  id: string;
  loginId: string;
  authProvider: string;
  revision: string;
  person: Person;

  constructor(id: string, loginId: string, authProvider: string, revision: string, person: Person) {
    this.id = id;
    this.loginId = loginId;
    this.authProvider = authProvider;
    this.revision = revision;
    this.person = person;
  }
}
