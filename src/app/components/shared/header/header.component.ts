import { Component, HostListener, Inject, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { AuthProvider } from '../../../models/auth-provider';
import { DOCUMENT, Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/http/user.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { BonusTokenService } from '../../../services/http/bonus-token.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { Theme } from '../../../../theme/Theme';
import { ThemeService } from '../../../../theme/theme.service';
import { LanguageService } from '../../../services/util/language.service';
import { RoutingService } from '../../../services/util/routing.service';
import { ConsentService } from '../../../services/util/consent.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  auth: ClientAuthentication;
  cTime: string;
  shortId: string;
  deviceType: string;
  moderationEnabled: boolean;
  isGuest = true;
  isAdmin = false;

  /* FIXME: Those role values are not updated to the real role. */
  isParticipant = true;
  isCreator = false;

  themeClass: String;
  themes: Theme[];
  deviceWidth = innerWidth;
  helpUrl: string;
  privacyUrl: string;
  imprintUrl: string;
  showNews: boolean;
  lang: string;

  constructor(
    public location: Location,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    public router: Router,
    private translationService: TranslateService,
    private langService: LanguageService,
    private userService: UserService,
    public eventService: EventService,
    private bonusTokenService: BonusTokenService,
    private _r: Renderer2,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private themeService: ThemeService,
    private routingService: RoutingService,
    private route: ActivatedRoute,
    private consentService: ConsentService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    // LocalStorage setup
    this.translationService.setDefaultLang('en');
    if (!this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)) {
      const lang = this.translationService.getBrowserLang();
      this.setLang(lang);
    } else {
      this.setLang(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (document.getElementById('back-button') && KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit0) === true &&
      this.eventService.focusOnInput === false) {
      document.getElementById('back-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit9) === true && this.eventService.focusOnInput === false) {
      if (this.auth) {
        document.getElementById('room-button').focus();
      } else {
        document.getElementById('login-button').focus();
      }
    }
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().subscribe(auth => {
      this.auth = auth;
      this.isGuest = !auth || auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      this.isAdmin = !!auth && this.authenticationService.hasAdminRole(auth);
    });

    let time = new Date();
    this.getTime(time);
    setInterval(() => {
      time = new Date();
      this.getTime(time);
    }, 1000);

    this.router.events.subscribe(val => {
      /* the router will fire multiple events */
      /* we only want to react if it's the final active route */
      if (val instanceof NavigationEnd) {
        /* segments gets all parts of the url */
        const segments = this.router.parseUrl(this.router.url).root.children.primary.segments;
        const shortIdRegExp = new RegExp('^[0-9]{8}$');
        segments.forEach(element => {
          /* searches the url segments for a short id */
          if (shortIdRegExp.test(element.path)) {
            this.shortId = element.path;
          }
        });
      }
    });
    this.moderationEnabled = !!this.globalStorageService.getItem(STORAGE_KEYS.MODERATION_ENABLED);
    this.themeService.getTheme().subscribe(theme => {
      this.themeClass = theme;
    });
    this.themes = this.themeService.getThemes();
    this.route.data.subscribe(data => {
      this.helpUrl = data.apiConfig.ui.links?.help?.url;
      this.privacyUrl = data.apiConfig.ui.links?.privacy?.url;
      this.imprintUrl = data.apiConfig.ui.links?.imprint?.url ;
    });
    this.showNews = false;
  }

  setLang(lang: string) {
    if (['de', 'en'].indexOf(lang) === -1) {
      lang = 'en';
    }
    this.useLanguage(lang);
  }

  getTime(time: Date) {
    const hh = ('0' + time.getHours()).substr(-2);
    const mm = ('0' + time.getMinutes()).substr(-2);
    this.cTime = hh + ':' + mm;
  }

  logout() {
    /*
    if (this.user.authProvider === AuthProvider.ARSNOVA_GUEST) {
      this.bonusTokenService.getTokensByUserId(this.user.id).subscribe(list => {
        if (list && list.length > 0) {
          const dialogRef = this.dialogService.openTokenReminderDialog();
          dialogRef.afterClosed().subscribe(result => {
            if (result === 'logout') {
              this.logoutUser();
            }
          });
        } else {
          this.logoutUser();
        }
      });
    } else {
      this.logoutUser();
    }
    */
    this.logoutUser();
  }

  logoutUser() {
    this.authenticationService.logout();
    this.translationService.get('header.logged-out').subscribe(message => {
      this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
    });
    this.navToHome();
  }

  goBack() {
    this.routingService.goBack();
  }

  navToLogin() {
    this.router.navigate(['login']);
  }

  navToHome() {
    this.router.navigate(['/']);
  }

  deleteAccount(id: string) {
    this.userService.delete(id).subscribe();
    this.authenticationService.logout();
    this.translationService.get('header.account-deleted').subscribe(msg => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    });
    this.navToHome();
  }

  openDeleteUserDialog() {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-account');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'abort') {
        return;
      } else if (result === 'delete') {
        this.deleteAccount(this.auth.userId);
      }
    });
  }

  useLanguage(language: string) {
    this.translationService.use(language);
    this.lang = language;
    this.globalStorageService.setItem(STORAGE_KEYS.LANGUAGE, language);
    this.document.documentElement.lang = language;
    this.langService.langEmitter.emit(language);
  }

  changeTheme(theme: Theme) {
    this.themeClass = theme.key;
    this.themeService.activate(theme.key);
  }

  openUpdateInfoDialog() {
    const dialogRef = this.dialogService.openUpdateInfoDialog(true);
    dialogRef.afterClosed().subscribe(() => {
      this.showNews = false;
    });
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }

  /*
  openUserBonusTokenDialog() {
    this.dialogService.openBonusTokenDialog(this.user.id);
  }
  */
}
