import { Announcement } from './announcement';

export class UserAnnouncement extends Announcement {
  roomName: string;

  constructor(roomId: string, title: string, body: string, roomName: string) {
    super(roomId, title, body);
    this.roomName = roomName;
  }
}
