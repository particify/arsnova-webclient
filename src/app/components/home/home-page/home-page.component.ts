import { AfterContentInit, Component, HostListener } from '@angular/core';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { DialogService } from '../../../services/util/dialog.service';
import { EventService } from '../../../services/util/event.service';
import { GlobalStorageService, MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterContentInit {

  deviceType: string;

  constructor(
    private dialogService: DialogService,
    private eventService: EventService,
    private globalStorageService: GlobalStorageService
  ) {
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && this.eventService.focusOnInput === false) {
      document.getElementById('session-id-input').focus();
      this.eventService.makeFocusOnInputTrue();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && this.eventService.focusOnInput === false) {
      document.getElementById('new-session-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && this.eventService.focusOnInput === false) {
      document.getElementById('language-menu').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true && this.eventService.focusOnInput === true) {
      this.eventService.makeFocusOnInputFalse();
      document.getElementById('key-combinations').focus();
    }
  }

  ngAfterContentInit(): void {
    if (this.deviceType === 'desktop') {
      document.getElementById('session-id-input').focus();
      this.eventService.makeFocusOnInputTrue();
    } else {
      document.getElementById('welcome-message').focus();
    }
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }

  cookiesDisabled(): boolean {
    return this.globalStorageService.getLocalStorageItem(LocalStorageKey.COOKIE_CONSENT) === 'false';
  }
}
