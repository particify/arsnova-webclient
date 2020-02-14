import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {

  settingsComponents = [
    { headerName: 'room-page.general', componentName: 'generalSettings' },
    { headerName: 'room-page.comments', componentName: 'commentSettings' },
    { headerName: 'room-page.moderators', componentName: 'moderatorSettings' },
    { headerName: 'room-page.bonus-token-header', componentName: 'tokenSettings' },
    { headerName: 'room-page.tags', componentName: 'tagSettings' }
  ];

  room: Room;

  constructor(protected roomService: RoomService) { }

  ngOnInit(): void {
    const shortId = localStorage.getItem('shortId');
    this.roomService.getRoomByShortId(shortId).subscribe(room => {
      this.room = room;
    });
  }

}
