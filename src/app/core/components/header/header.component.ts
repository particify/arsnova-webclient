import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/core/services/http/user.service';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ConsentService } from '@app/core/services/util/consent.service';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';
import { MatDialog } from '@angular/material/dialog';
import { AnnouncementListComponent } from '@app/shared/announcement-list/announcement-list.component';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { AnnouncementState } from '@app/core/models/announcement-state';
import {
  ChangeType,
  EntityChangeNotification,
} from '@app/core/models/events/entity-change-notification';
import { Language } from '@app/core/models/language';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { BaseDialogComponent } from '@app/shared/_dialogs/base-dialog/base-dialog.component';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  auth?: ClientAuthentication;
  deviceType: string;

  role: UserRole;
  UserRole: typeof UserRole = UserRole;

  currentTheme: string;
  themes: string[];
  deviceWidth = innerWidth;
  helpUrl: string;
  privacyUrl: string;
  imprintUrl: string;
  translateUrl: string;
  currentLang: string;
  langs: Language[];
  HotkeyAction = HotkeyAction;
  isRoom: boolean;
  isPreview: boolean;
  userCharacter: string;
  openPresentationDirectly = false;
  announcementState?: AnnouncementState;
  room?: Room;

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
    private extensionFactory: ExtensionFactory,
    private dialog: MatDialog,
    private announcementService: AnnouncementService,
    private roomService: RoomService
  ) {
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
    this.currentLang = this.translationService.currentLang;
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().subscribe((auth) => {
      this.auth = auth;
      this.userCharacter = this.auth?.loginId.slice(0, 1).toLocaleUpperCase();
      this.getAnnouncementState();
    });
    this.eventService
      .on('EntityChangeNotification')
      .subscribe((notification) => {
        if (this.role !== UserRole.OWNER) {
          const entityType = (notification as EntityChangeNotification).payload
            .entityType;
          const changeType = (notification as EntityChangeNotification).payload
            .changeType;
          if (
            entityType === 'Announcement' &&
            [ChangeType.CREATE, ChangeType.UPDATE].includes(changeType)
          ) {
            this.getAnnouncementState();
          }
        }
      });
    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeService.getCurrentTheme$().subscribe((theme) => {
      if (theme) {
        this.currentTheme = theme;
      }
    });
    this.themes = this.themeService.getThemes();
    this.langs = this.langService.getLangs();
    this.route.data.subscribe((data) => {
      this.helpUrl = data.apiConfig.ui.links?.help?.url;
      this.privacyUrl = data.apiConfig.ui.links?.privacy?.url;
      this.imprintUrl = data.apiConfig.ui.links?.imprint?.url;
      this.translateUrl = data.apiConfig.ui.links?.translate?.url;
    });
    this.roomService
      .getCurrentRoomStream()
      .subscribe((room) => (this.room = room));
    this.isPreview = this.routingService.isPreview;
    this.routingService.getIsPreview().subscribe((isPreview) => {
      this.isPreview = isPreview;
    });
    this.role = this.routingService.role;
    this.routingService.getRole().subscribe((role) => {
      this.role = role;
    });
    this.openPresentationDirectly =
      !this.extensionFactory.getExtension('present-in-new-tab');
  }

  getAnnouncementState() {
    if (this.auth) {
      this.announcementService
        .getStateByUserId(this.auth.userId)
        .subscribe((state) => {
          this.announcementState = state;
        });
    } else {
      this.announcementState = undefined;
    }
  }

  changeLanguage(lang: Language) {
    this.langService.setLang(lang.key);
    this.currentLang = lang.key;

    if (lang.category === LanguageCategory.COMMUNITY) {
      const data: { [key: string]: string } = {
        dialogId: 'community-lang',
        section: 'dialog',
        headerLabel: 'you-are-using-community-lang',
        body: 'community-lang',
        confirmLabel: 'close',
        type: 'button-primary',
      };
      if (this.translateUrl) {
        data['additionalBody'] = 'contribute-to-lang';
        data['link'] = this.translateUrl + lang.key;
        data['linkText'] = 'translation-server';
      }
      this.dialog.open(BaseDialogComponent, {
        width: '400px',
        data: data,
      });
    }
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
    this.router.navigateByUrl('account/user');
  }

  deleteAccount(id: string) {
    this.userService.delete(id).subscribe();
    this.authenticationService.logout();
    this.translationService.get('header.account-deleted').subscribe((msg) => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    });
    this.navToHome();
  }

  openDeleteUserDialog() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'account',
      'really-delete-account'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'abort' || !this.auth) {
        return;
      } else if (result === 'delete') {
        this.deleteAccount(this.auth.userId);
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }

  presentCurrentView(shouldOpen = this.openPresentationDirectly) {
    if (shouldOpen) {
      this.routingService.navToPresentation();
    }
  }

  checkIfOpenPresentationDirectly(isVisble: boolean) {
    this.openPresentationDirectly = !isVisble;
  }

  switchRole() {
    this.routingService.switchRole();
  }

  goToSettings() {
    this.routingService.navToSettings();
  }

  showNews() {
    const dialogRef = this.dialog.open(AnnouncementListComponent, {
      panelClass: 'dialog-margin',
      width: '90%',
      maxWidth: '872px',
      data: {
        state: this.announcementState,
      },
    });
    dialogRef.afterClosed().subscribe((newReadTimestamp) => {
      if (this.announcementState) {
        this.announcementState.readTimestamp = newReadTimestamp;
      }
    });
  }

  leaveRoom() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'leave-room',
      'really-leave-room',
      undefined,
      'leave'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'leave') {
        this.router.navigateByUrl('user');
      }
    });
  }
}
