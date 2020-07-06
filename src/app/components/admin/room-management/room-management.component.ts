import { Component } from '@angular/core';
import { Room } from 'app/models/room';
import { RoomService } from 'app/services/http/room.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html'
})
export class RoomManagementComponent {
  room: Observable<Room>;

  constructor(protected roomService: RoomService) {
    id = id.replace(' ', '');
  }

  loadEntity(id: string) {
    this.room = this.roomService.getRoom(id)
  }
}
