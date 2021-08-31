import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { HotkeyService } from '../../../services/util/hotkey.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit, OnDestroy, AfterContentInit {

  auth: ClientAuthentication;

  private hotkeyRefs: Symbol[] = [];

  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private authenticationService: AuthenticationService,
    private globalStorageService: GlobalStorageService,
    private announceService: AnnounceService,
    private hotkeyService: HotkeyService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('user-message').focus();
    }, 500);
  }

  ngOnInit() {
    this.authenticationService.getCurrentAuthentication()
        .subscribe(auth => this.auth = auth);
    this.hotkeyService.registerHotkey({
      key: 'Escape',
      action: () => this.announce(),
      actionTitle: 'TODO'
    }, this.hotkeyRefs);
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
  }

  announce() {
    this.announceService.announce('home-page.a11y-user-shortcuts');
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }
}
