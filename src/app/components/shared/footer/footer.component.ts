import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { User } from '../../../models/user';
import { Room } from '../../../models/room';
import { ThemeService } from '../../../../theme/theme.service';
import { Theme } from '../../../../theme/Theme';
import { DialogService } from '../../../services/util/dialog.service';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { GlobalStorageService, LocalStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public room: Room;
  public user: User;

  public open: string;
  public deviceWidth = innerWidth;
  public lang: string;
  public cookieAccepted: boolean;
  public dataProtectionConsent: boolean;

  public themeClass: String;

  public themes: Theme[];

  constructor(
    public notificationService: NotificationService,
    public router: Router,
    private translateService: TranslateService,
    private langService: LanguageService,
    public authenticationService: AuthenticationService,
    private themeService: ThemeService,
    private dialogService: DialogService,
    private apiConfigService: ApiConfigService,
    private globalStorageService: GlobalStorageService
  ) {
    this.themeClass = this.globalStorageService.getLocalStorageItem(LocalStorageKey.THEME);
    this.lang = this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.themeService.getTheme().subscribe(theme => {
      this.themeClass = theme;
    });
    this.translateService.use(this.lang);
    this.translateService.get('footer.open').subscribe(message => {
      this.open = message;
    });
    this.themes = this.themeService.getThemes();
    this.cookieAccepted = this.globalStorageService.getLocalStorageItem(LocalStorageKey.COOKIE_CONSENT) === 'true';
    this.dataProtectionConsent = this.globalStorageService.getLocalStorageItem(LocalStorageKey.DATA_PROTECTION) === 'true';

    if (!this.globalStorageService.getLocalStorageItem(LocalStorageKey.COOKIE_CONSENT)) {
      this.showCookieModal();
    } else {
      if (!this.cookieAccepted || !this.dataProtectionConsent) {
        this.showOverlay();
      }
    }
  }

  getUIDataFromConfig(type: string): string {
    return this.apiConfigService.getUiConfig()[type][this.lang];
  }

  showIntroduction() {
    const introductionBody = this.getUIDataFromConfig('introduction');
    this.dialogService.openInfoDialog('introduction', introductionBody);
  }

  showImprint() {
    const imprintBody = this.getUIDataFromConfig('legal-info');
    this.dialogService.openInfoDialog('imprint', imprintBody);
  }

  showDataProtection() {
    const dataProtectionBody = this.getUIDataFromConfig('privacy-info');
    this.dialogService.openInfoDialog('data-protection', dataProtectionBody);
  }

  showCookieModal() {
    const dialogRef = this.dialogService.openCookieDialog();
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(res => {
      this.cookieAccepted = res;
      this.dataProtectionConsent = res;
      if (!res) {
        this.showOverlay();
      }
    });
  }

  showOverlay() {
    const dialogRef = this.dialogService.openOverlayDialog();
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (!this.cookieAccepted) {
          this.showCookieModal();
        } else if (!this.dataProtectionConsent) {
          this.showDataProtection();
        }
      }
    });
  }

  useLanguage(language: string) {
    this.translateService.use(language);
    this.globalStorageService.setLocalStorageItem(LocalStorageKey.LANGUAGE, language);
    this.langService.langEmitter.emit(language);
  }

  changeTheme(theme: Theme) {
    this.themeClass = theme.key;
    this.themeService.activate(theme.key);
  }

  getLanguage(): string {
    return this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE);
  }
}
