export class RoomCreated {
  type: string;
  payload: {
    id: string;
    shortId: string;
  };

  constructor(id: string, shortId: string) {
    this.type = 'RoomCreated';
    this.payload = {
      id: id,
      shortId: shortId
    };
  }
}
