import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { User } from '../../../models/user';
import { Room } from '../../../models/room';
import { ThemeService } from '../../../../theme/theme.service';
import { CookiesComponent } from '../../home/_dialogs/cookies/cookies.component';
import { Theme } from '../../../../theme/Theme';
import { OverlayComponent } from '../../home/_dialogs/overlay/overlay.component';
import { DialogService } from '../../../services/util/dialog.service';
import { ApiConfigService } from '../../../services/http/api-config.service';

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
  public lang = localStorage.getItem('currentLang');
  public cookieAccepted: boolean;
  public dataProtectionConsent: boolean;

  public themeClass = localStorage.getItem('theme');

  public themes: Theme[];

  constructor(public notificationService: NotificationService,
              public router: Router,
              public dialog: MatDialog,
              private translateService: TranslateService,
              private langService: LanguageService,
              public authenticationService: AuthenticationService,
              private themeService: ThemeService,
              private dialogService: DialogService,
              private apiConfigService: ApiConfigService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    if (!this.themeService.getTheme()['source']['_value']) {
      if (this.deviceWidth < 500) {
        this.themeService.activate('dark');
        this.themeClass = 'dark';
      } else {
        this.themeService.activate('arsnova');
        this.themeClass = 'arsnova';
      }
    }
    this.translateService.use(this.lang);
    this.translateService.get('footer.open').subscribe(message => {
      this.open = message;
    });
    this.themes = this.themeService.getThemes();
    this.cookieAccepted = localStorage.getItem('cookieAccepted') === 'true';
    this.dataProtectionConsent = localStorage.getItem('dataProtectionConsent') === 'true';

    if (!localStorage.getItem('cookieAccepted')) {
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
    const dialogRef = this.dialog.open(CookiesComponent, {
      width: '80%',
      autoFocus: true

    });
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
    const dialogRef = this.dialog.open(OverlayComponent, {});
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
    localStorage.setItem('currentLang', language);
    this.langService.langEmitter.emit(language);
  }

  changeTheme(theme: Theme) {
    this.themeClass = theme.key;
    this.themeService.activate(theme.key);
  }

  getLanguage(): string {
    return localStorage.getItem('currentLang');
  }
}
