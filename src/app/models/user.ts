import { Person } from './person';
import { UserSettings } from './user-settings';

export class User {
  id: string;
  loginId: string;
  authProvider: string;
  revision: string;
  person: Person;
  settings: UserSettings;

  constructor(id: string, loginId: string, authProvider: string, revision: string, person: Person, settings: UserSettings = new UserSettings()) {
    this.id = id;
    this.loginId = loginId;
    this.authProvider = authProvider;
    this.revision = revision;
    this.person = person;
    this.settings = settings;
  }
}
