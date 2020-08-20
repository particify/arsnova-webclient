import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Room } from '../../../models/room';
import { ThemeService } from '../../../../theme/theme.service';
import { Theme } from '../../../../theme/Theme';
import { DialogService } from '../../../services/util/dialog.service';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ConsentService } from '../../../services/util/consent.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public room: Room;

  public open: string;
  public deviceWidth = innerWidth;
  public lang: string;

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
    private globalStorageService: GlobalStorageService,
    private consentService: ConsentService
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

    if (this.consentService.consentRequired()) {
      this.consentService.openDialog();
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

  showCookieSettings() {
    this.consentService.openDialog();
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
