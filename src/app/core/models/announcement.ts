export class Announcement {
  id: string;
  roomId: string;
  revision: string;
  title: string;
  body: string;
  renderedBody: string;
  creationTimestamp: Date;
  updateTimestamp: Date;

  constructor(roomId: string, title: string, body: string) {
    this.roomId = roomId;
    this.title = title;
    this.body = body;
  }
}
