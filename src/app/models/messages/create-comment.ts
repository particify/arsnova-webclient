export class CreateComment {
  type: string;
  payload: {
    roomId: string;
    creatorId: string;
    body: string;
    tag: string;
    imageLinks: String[];
  };

  constructor(roomId: string, creatorId: string, body: string, tag: string = '', imageLinks: String[]) {
    this.type = 'CreateComment';
    this.payload = {
      roomId: roomId,
      creatorId: creatorId,
      body: body,
      tag: tag,
      imageLinks: imageLinks
    };
  }
}
