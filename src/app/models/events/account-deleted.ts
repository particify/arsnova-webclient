export class AccountDeleted {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'AccountDeleted';
    this.payload = {};
  }
}
