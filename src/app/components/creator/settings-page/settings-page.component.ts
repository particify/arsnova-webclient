import { Component, HostListener, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute } from '@angular/router';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { EventService } from '../../../services/util/event.service';
import { LanguageService } from '../../../services/util/language.service';
import { TranslateService } from '@ngx-translate/core';

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
    { headerName: 'general', iconName: 'settings', componentName: 'general' },
    { headerName: 'comments', iconName: 'comment', componentName: 'comments' },
    { headerName: 'moderators', iconName: 'gavel', componentName: 'moderators' }
  ];

  // { headerName: 'settings.bonus-token', iconName: 'grade', componentName: 'tokenSettings' },

  room: Room;
  isLoading = true;
  errorOnLoading = false;

  constructor(
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected eventService: EventService,
    protected langService: LanguageService,
    protected translateService: TranslateService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('general').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      document.getElementById('comments').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('moderators').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('tags').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      this.announce();
    }
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.isLoading = false;
      setTimeout(() => {
        document.getElementById('message-button').focus();
      }, 500);
    });
  }

  announce() {
    document.getElementById('keys-button').focus();
  }

  updateRoom(room: Room) {
    this.room = room;
  }

}
