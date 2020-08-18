import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { NotificationService } from '../../../services/util/notification.service';
import { NavigationEnd, Router } from '@angular/router';
import { ClientAuthentication } from 'app/models/client-authentication';
import { AuthProvider } from 'app/models/auth-provider';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/http/user.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { BonusTokenService } from '../../../services/http/bonus-token.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';

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
  isSafari = 'false';
  moderationEnabled: boolean;
  isGuest = true;
  isAdmin = false;

  /* FIXME: Those role values are not updated to the real role. */
  isParticipant = true;
  isCreator = false;

  constructor(
    public location: Location,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    public router: Router,
    private translationService: TranslateService,
    private userService: UserService,
    public eventService: EventService,
    private bonusTokenService: BonusTokenService,
    private _r: Renderer2,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    this.isSafari = this.globalStorageService.getItem(STORAGE_KEYS.IS_SAFARI);

    // LocalStorage setup
    if (!this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)) {
      const lang = this.translationService.getBrowserLang();
      this.translationService.setDefaultLang(lang);
      this.globalStorageService.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } else {
      this.translationService.setDefaultLang(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
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
    if (this.globalStorageService.getItem(STORAGE_KEYS.LOGGED_IN)) {
      this.authenticationService.refreshLogin().subscribe();
    }

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
  }

  getTime(time: Date) {
    const hh = ('0' + time.getHours()).substr(-2);
    const mm = ('0' + time.getMinutes()).substr(-2);
    this.cTime = hh + ':' + mm;
  }

  logout() {
    /*
    if (this.user.authProvider === 'ARSNOVA_GUEST') {
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
      this.notificationService.show(message);
    });
    this.navToHome();
  }

  goBack() {
    this.location.back();
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
      this.notificationService.show(msg);
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

  /*
  openUserBonusTokenDialog() {
    this.dialogService.openBonusTokenDialog(this.user.id);
  }
  */
}
