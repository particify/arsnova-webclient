import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { User } from '../../../models/user';
import { Room } from '../../../models/room';
import { IntroductionComponent } from '../../home/_dialogs/introduction/introduction.component';
import { ThemeService } from '../../../../theme/theme.service';
import { CookiesComponent } from '../../home/_dialogs/cookies/cookies.component';
import { ImprintComponent } from '../../home/_dialogs/imprint/imprint.component';
import { DataProtectionComponent } from '../../home/_dialogs/data-protection/data-protection.component';
import { Theme } from '../../../../theme/Theme';
import { OverlayComponent } from '../../home/_dialogs/overlay/overlay.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public room: Room;
  public user: User;

  public open: string;
  public deviceType: string;
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
              private themeService: ThemeService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.deviceType = localStorage.getItem('deviceType');
    if (!this.themeService.getTheme()['source']['_value']) {
      if (this.deviceType === 'mobile') {
        this.themeService.activate('dark');
        this.themeClass = 'dark';
      } else {
        this.themeService.activate('arsnova');
        this.themeClass = 'arsnova';
      }
    }
    this.translateService.use(localStorage.getItem('currentLang'));
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

  showDemo() {
    const dialogRef = this.dialog.open(IntroductionComponent, {
      width: '80%'
    });
    dialogRef.componentInstance.deviceType = this.deviceType;
  }

  showCookieModal() {
    const dialogRef = this.dialog.open(CookiesComponent, {
      width: '80%',
      autoFocus: true

    });
    dialogRef.disableClose = true;
    dialogRef.componentInstance.deviceType = this.deviceType;
    dialogRef.afterClosed().subscribe(res => {
      this.cookieAccepted = res;
      this.dataProtectionConsent = res;
      if (!res) {
        this.showOverlay();
      }
    });
  }

  showImprint() {
    const dialogRef = this.dialog.open(ImprintComponent, {
      width: '80%'
    });
  }

  showDataProtection() {
    const dialogRef = this.dialog.open(DataProtectionComponent, {
      width: '80%'
    });

  }

  showOverlay() {
    const dialogRef = this.dialog.open(OverlayComponent, {});
    dialogRef.componentInstance.deviceType = this.deviceType;
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
