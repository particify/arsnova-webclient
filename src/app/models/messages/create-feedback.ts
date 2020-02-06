export class CreateFeedback {
  type: string;
  payload: {
    roomId: string;
    userId: string;
    value: number;
  };

  constructor(roomId: string, userId: string, val: number) {
    this.type = 'CreateFeedback';
    this.payload = {
      roomId: roomId,
      userId: userId,
      value: val
    };
  }
}
