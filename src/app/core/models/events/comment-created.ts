export class CommentCreated {
  type: string;
  payload: Record<string, never>;

  constructor() {
    this.type = 'CommentCreated';
    this.payload = {};
  }
}
