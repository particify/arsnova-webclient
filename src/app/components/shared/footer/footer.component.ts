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
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

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
    this.themeClass = this.globalStorageService.getItem(STORAGE_KEYS.THEME);
    this.lang = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
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
    this.cookieAccepted = this.globalStorageService.getItem(STORAGE_KEYS.COOKIE_CONSENT);

    if (!this.cookieAccepted) {
      if (this.cookieAccepted === false) {
        this.showOverlay();
      } else {
        this.showCookieModal();
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
        this.showCookieModal();
      }
    });
  }

  useLanguage(language: string) {
    this.translateService.use(language);
    this.globalStorageService.setItem(STORAGE_KEYS.LANGUAGE, language);
    this.langService.langEmitter.emit(language);
  }

  changeTheme(theme: Theme) {
    this.themeClass = theme.key;
    this.themeService.activate(theme.key);
  }

  getLanguage(): string {
    return this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
  }
}
