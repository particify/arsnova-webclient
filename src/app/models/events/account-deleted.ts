export class AccountDeleted {
  type: string;
  payload: {};

  constructor() {
    this.type = 'AccountDeleted';
    this.payload = {};
  }
}
