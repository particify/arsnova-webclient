import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {

  settingsComponents = [
    { headerName: 'settings.general', componentName: 'generalSettings' },
    { headerName: 'settings.comments', componentName: 'commentSettings' },
    { headerName: 'settings.moderators', componentName: 'moderatorSettings' },
    { headerName: 'settings.bonus-token-header', componentName: 'tokenSettings' },
    { headerName: 'settings.tags', componentName: 'tagSettings' }
  ];

  room: Room;
  isLoading = true;

  constructor(protected roomService: RoomService,
              protected route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const shortId = params['shortId'];
      this.roomService.getRoomByShortId(shortId).subscribe(room => {
        this.room = room;
        this.isLoading = false;
      });
    });
  }

}
