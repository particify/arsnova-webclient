export class DemoRoomCreated {
  type: string;
  payload: {
    id: string;
    shortId: string;
  };

  constructor(id: string, shortId: string) {
    this.type = 'DemoRoomCreated';
    this.payload = {
      id: id,
      shortId: shortId
    };
  }
}
