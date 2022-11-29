export class AccountCreated {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'AccountCreated';
    this.payload = {};
  }
}
