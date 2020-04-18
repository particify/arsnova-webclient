import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { NotificationService } from '../../../services/util/notification.service';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '../../../models/user';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/http/user.service';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { BonusTokenService } from '../../../services/http/bonus-token.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User;
  cTime: string;
  shortId: string;
  deviceType: string;
  isSafari = 'false';
  moderationEnabled: boolean;

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
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
    this.isSafari = this.globalStorageService.getMemoryItem(MemoryStorageKey.IS_SAFARI);

    // LocalStorage setup
    if (!this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE)) {
      const lang = this.translationService.getBrowserLang();
      this.translationService.setDefaultLang(lang);
      this.globalStorageService.setLocalStorageItem(LocalStorageKey.LANGUAGE, lang);
    } else {
      this.translationService.setDefaultLang(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (document.getElementById('back-button') && KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit0) === true &&
      this.eventService.focusOnInput === false) {
      document.getElementById('back-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && this.eventService.focusOnInput === false) {
      if (this.user) {
        document.getElementById('session-button').focus();
      } else {
        document.getElementById('login-button').focus();
      }
    }
  }

  ngOnInit() {
    if (this.globalStorageService.getLocalStorageItem(LocalStorageKey.LOGGED_IN) === 'true') {
      this.authenticationService.refreshLogin();
    }

    this.authenticationService.watchUser.subscribe(newUser => this.user = newUser);

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
    this.moderationEnabled = (this.globalStorageService.getMemoryItem(MemoryStorageKey.MODERATION_ENABLED) === 'true') ? true : false;
  }

  getTime(time: Date) {
    const hh = ('0' + time.getHours()).substr(-2);
    const mm = ('0' + time.getMinutes()).substr(-2);
    this.cTime = hh + ':' + mm;
  }

  logout() {
    // ToDo: Fix this madness.
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
        this.deleteAccount(this.user.id);
      }
    });
  }

  openUserBonusTokenDialog() {
    this.dialogService.openBonusTokenDialog(this.user.id);
  }

  cookiesDisabled(): boolean {
    return this.globalStorageService.getLocalStorageItem(LocalStorageKey.COOKIE_CONSENT) === 'false';
  }
}
