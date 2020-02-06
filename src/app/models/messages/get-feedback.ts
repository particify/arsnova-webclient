export class GetFeedback {
  type: string;
  payload: {
    roomId: string;
  };

  constructor(roomId: string) {
    this.type = 'GetFeedback';
    this.payload = {
      roomId: roomId
    };
  }
}
