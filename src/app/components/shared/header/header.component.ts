import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientAuthentication } from '../../../models/client-authentication';
import { AuthProvider } from '../../../models/auth-provider';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/http/user.service';
import { EventService } from '../../../services/util/event.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { Theme } from '../../../../theme/Theme';
import { ThemeService } from '../../../../theme/theme.service';
import { LanguageService } from '../../../services/util/language.service';
import { RoutingService } from '../../../services/util/routing.service';
import { ConsentService } from '../../../services/util/consent.service';
import { HotkeyAction } from '../../../directives/hotkey.directive';
import { UserRole } from '../../../models/user-roles.enum';
import { ExtensionFactory } from '../../../../../projects/extension-point/src/public-api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  auth: ClientAuthentication;
  deviceType: string;

  role: UserRole;
  UserRole: typeof UserRole = UserRole;

  themeClass: String;
  themes: Theme[];
  deviceWidth = innerWidth;
  helpUrl: string;
  privacyUrl: string;
  imprintUrl: string;
  showNews: boolean;
  lang: string;
  HotkeyAction = HotkeyAction;
  isRoom: boolean;
  isPreview: boolean;
  userCharacter: string;
  openPresentationDirectly = false;

  constructor(
    public location: Location,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    public router: Router,
    private translationService: TranslateService,
    private langService: LanguageService,
    private userService: UserService,
    public eventService: EventService,
    private _r: Renderer2,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private themeService: ThemeService,
    private routingService: RoutingService,
    private route: ActivatedRoute,
    private consentService: ConsentService,
    private extensionFactory: ExtensionFactory
  ) {
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    this.lang = this.translationService.currentLang;
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().subscribe(auth => {
      this.auth = auth;
      this.userCharacter = this.auth?.loginId.slice(0, 1).toLocaleUpperCase();
    });

    this.themeService.getTheme().subscribe(theme => {
      this.themeClass = theme;
    });
    this.themes = this.themeService.getThemes();
    this.route.data.subscribe(data => {
      this.helpUrl = data.apiConfig.ui.links?.help?.url;
      this.privacyUrl = data.apiConfig.ui.links?.privacy?.url;
      this.imprintUrl = data.apiConfig.ui.links?.imprint?.url ;
    });
    this.translationService.onLangChange.subscribe(e => this.lang = e.lang);
    this.showNews = false;
    this.isRoom = this.routingService.isRoom;
    this.routingService.getIsRoom().subscribe(isRoom => {
      this.isRoom = isRoom;
    });
    this.isPreview = this.routingService.isPreview;
    this.routingService.getIsPreview().subscribe(isPreview => {
      this.isPreview = isPreview;
    });
    this.role = this.routingService.role;
    this.routingService.getRole().subscribe(role => {
      this.role = role;
    });
    this.openPresentationDirectly = !this.extensionFactory.getExtension('present-in-new-tab');
  }

  changeLanguage(lang: string) {
    this.langService.setLang(lang);
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  isGuest(): boolean {
    return !this.auth || this.auth.authProvider === AuthProvider.ARSNOVA_GUEST;
  }

  isAdmin(): boolean {
    return !!this.auth && this.authenticationService.hasAdminRole(this.auth);
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
    const msg = this.translationService.instant('header.logged-out');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    this.navToHome();
  }

  goBack() {
    this.routingService.goBack();
  }

  navToLogin() {
    this.router.navigateByUrl('login');
  }

  navToHome() {
    this.router.navigateByUrl('');
  }

  navToUserHome() {
    this.router.navigate(['user']);
  }

  navToProfile() {
    this.router.navigateByUrl('account');
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

  presentCurrentView(shouldOpen = this.openPresentationDirectly) {
    if (shouldOpen) {
      this.routingService.navToPresentation();
    }
  }

  switchRole() {
    this.routingService.switchRole();
  }

  goToSettings() {
    this.routingService.navToSettings();
  }

  /*
  openUserBonusTokenDialog() {
    this.dialogService.openBonusTokenDialog(this.user.id);
  }
  */
}
