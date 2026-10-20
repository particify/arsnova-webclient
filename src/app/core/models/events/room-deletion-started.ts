export class RoomDeletionStarted {
  type: string;
  payload: {
    id: string;
  };

  constructor(id: string) {
    this.type = 'RoomDeletionStarted';
    this.payload = {
      id: id,
    };
  }
}
