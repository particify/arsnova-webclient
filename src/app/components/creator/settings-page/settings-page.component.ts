import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../services/util/event.service';
import { LanguageService } from '../../../services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

export interface Settings {
  headerName: string;
  iconName: string;
  componentName: string;
  hotkey: string;
}

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {

  settings: Settings[] = [
    { headerName: 'general', iconName: 'settings', componentName: 'general', hotkey: '1' },
    { headerName: 'comments', iconName: 'comment', componentName: 'comments', hotkey: '2' },
    { headerName: 'access', iconName: 'admin_panel_settings', componentName: 'access', hotkey: '3' }
  ];

  room: Room;
  isLoading = true;
  errorOnLoading = false;

  constructor(
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected eventService: EventService,
    protected langService: LanguageService,
    protected translateService: TranslateService,
    private globalStorageService: GlobalStorageService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit(): void {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.isLoading = false;
      setTimeout(() => {
        document.getElementById('message-button').focus();
      }, 500);
    });
  }

  updateRoom(room: Room) {
    this.room = room;
  }

}
