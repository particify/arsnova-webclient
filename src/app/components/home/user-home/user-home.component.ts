import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { User } from '../../../models/user';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit, AfterContentInit {

  user: User;

  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private authenticationService: AuthenticationService,
    private eventService: EventService,
    private globalStorageService: GlobalStorageService,
    private announceService: AnnounceService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && this.eventService.focusOnInput === false) {
      document.getElementById('create-session-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && this.eventService.focusOnInput === false) {
      document.getElementById('session-id-input').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && this.eventService.focusOnInput === false) {
      document.getElementById('room-list').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true &&
      this.eventService.focusOnInput === false) {
      this.announce();
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('user-message').focus();
    }, 500);
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    this.authenticationService.watchUser.subscribe(newUser => this.user = newUser);
  }

  announce() {
    this.announceService.announce('home-page.a11y-user-shortcuts');
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
