export class CommentCreated {
  type: string;
  payload: {};

  constructor() {
    this.type = 'CommentCreated';
    this.payload = {};
  }
}
