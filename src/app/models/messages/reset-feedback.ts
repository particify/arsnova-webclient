export class ResetFeedback {
  type: string;
  payload: {
    roomId: string;
  };

  constructor(roomId: string) {
    this.type = 'ResetFeedback';
    this.payload = {
      roomId: roomId
    };
  }
}
