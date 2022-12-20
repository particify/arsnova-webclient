import { Announcement } from './announcement';

export class UserAnnouncement extends Announcement {
  roomName: string;

  constructor(roomId: string, title: string, body: string) {
    super(roomId, title, body);
  }
}
