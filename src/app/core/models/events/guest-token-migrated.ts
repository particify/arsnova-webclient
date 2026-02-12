export class GuestTokenMigrated {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'GuestTokenMigrated';
    this.payload = {};
  }
}
