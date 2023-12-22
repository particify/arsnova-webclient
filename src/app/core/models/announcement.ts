// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class Announcement {
  id!: string;
  roomId: string;
  revision!: string;
  title: string;
  body: string;
  renderedBody!: string;
  creationTimestamp!: Date;
  updateTimestamp!: Date;

  constructor(roomId: string, title: string, body: string) {
    this.roomId = roomId;
    this.title = title;
    this.body = body;
  }
}
