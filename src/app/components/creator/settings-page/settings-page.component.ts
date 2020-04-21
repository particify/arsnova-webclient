import { Component, HostListener, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Room } from '../../../models/room';
import { ActivatedRoute } from '@angular/router';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { EventService } from '../../../services/util/event.service';

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
    protected route: ActivatedRoute,
    protected eventService: EventService
  ) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('room-settings').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('comment-settings').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('moderator-settings').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('category-settings').focus();
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

}
