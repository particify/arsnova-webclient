import { Room } from '@app/core/models/room';

export class UpdateEvent {
  room?: Room;
  showSuccessInfo: boolean;
  loadRoom: boolean;

  constructor(room: Room | null, showSuccessInfo: boolean, loadRoom = false) {
    if (room) {
      this.room = room;
    }
    this.showSuccessInfo = showSuccessInfo;
    this.loadRoom = loadRoom;
  }
}
