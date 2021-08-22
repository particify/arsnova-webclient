import { AfterContentInit, Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit, AfterContentInit {

  auth: ClientAuthentication;

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
    // TODO: use hotkey service
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true &&
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
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.auth = auth);
  }

  announce() {
    this.announceService.announce('home-page.a11y-user-shortcuts');
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
