export class CreateFeedback {
  type: string;
  payload: {
    userId: string,
    value: number;
  };

  constructor(userId: string, val: number) {
    this.type = 'CreateFeedback';
    this.payload = {
      userId: userId,
      value: val
    };
  }
}
