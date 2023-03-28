export class MembershipsChanged {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'MembershipsChanged';
    this.payload = {};
  }
}
