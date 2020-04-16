import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute } from '@angular/router';

export interface Settings {
  headerName: string;
  iconName: string;
  componentName: string;
}

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {

  settings: Settings[] = [
    { headerName: 'settings.general', iconName: 'settings', componentName: 'generalSettings' },
    { headerName: 'settings.comments', iconName: 'comment', componentName: 'commentSettings' },
    { headerName: 'settings.moderators', iconName: 'gavel', componentName: 'moderatorSettings' },
    { headerName: 'settings.bonus-token', iconName: 'grade', componentName: 'tokenSettings' },
    { headerName: 'settings.tags', iconName: 'bookmark', componentName: 'tagSettings' }
  ];

  room: Room;
  isLoading = true;
  errorOnLoading = false;

  constructor(
    protected roomService: RoomService,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.isLoading = false;
    });
  }

}
