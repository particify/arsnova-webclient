import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RoomService } from '@app/core/services/http/room.service';
import { DrawerService } from '@app/core/services/util/drawer.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { Language } from '@app/core/models/language';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthProvider } from '@app/core/models/auth-provider';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { UiConfig } from '@app/core/models/api-config';
import { UiService } from '@app/core/services/util/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    private languageService: LanguageService,
    private apiConfigService: ApiConfigService,
    private trackingService: TrackingService,
    private updateService: UpdateService,
    private routingService: RoutingService,
    public route: ActivatedRoute,
    public router: Router,
    private roomService: RoomService,
    private drawerService: DrawerService,
    private themeService: ThemeService,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private translationService: TranslocoService,
    private dialog: MatDialog,
    private featureFlagService: FeatureFlagService,
    private uiService: UiService
  ) {
    this.currentTheme = themeService.getCurrentTheme();
    this.themes = this.themeService.getThemes();
    this.langs = this.languageService.getLangs();
  }
  @ViewChild('mainDrawer') drawer!: MatDrawer;

  title = 'ARSnova';
  isPresentation = false;
  isAdmin = false;
  isRoom = false;
  auth?: ClientAuthentication;
  userCharacter?: string;
  uiConfig?: UiConfig;
  currentLang?: string;
  langs: Language[] = [];
  translateUrl?: string;
  currentTheme?: string;
  themes: string[] = [];
  contentGroupTemplatesActive = false;

  ngOnInit(): void {
    this.languageService.init();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkRoute((event as NavigationEnd).url);
      });
    this.routingService.subscribeActivatedRoute();
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      this.uiConfig = config.ui;
      this.translateUrl = config.ui.links?.translate?.url;
      this.trackingService.init(config.ui);
      this.updateService.handleUpdate(config.ui.versions);
    });
    this.roomService.getCurrentRoomStream().subscribe((room) => {
      this.isRoom = !!room;
    });
    this.authenticationService.getAuthenticationChanges().subscribe((auth) => {
      this.auth = auth;
      this.userCharacter = this.auth?.loginId.slice(0, 1).toLocaleUpperCase();
    });
    this.currentLang = this.translationService.getActiveLang();
    this.contentGroupTemplatesActive = this.featureFlagService.isEnabled(
      'CONTENT_GROUP_TEMPLATES'
    );
    this.uiService.setScrollbarWidthVariable();
  }

  ngAfterViewInit(): void {
    this.drawerService.setDrawer(this.drawer);
  }

  checkRoute(url: string) {
    this.isPresentation = this.routingService.isPresentation(url);
    this.isAdmin = this.routingService.isAdminView(url);
  }

  closeDrawer(): void {
    this.drawer.close();
  }

  logout() {
    this.authenticationService.logout();
    const msg = this.translationService.translate('header.logged-out');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    this.navToUrl('');
  }

  navToUrl(url: string): void {
    this.router.navigateByUrl(url);
    this.closeDrawer();
  }

  navToLogin() {
    this.navToUrl('login');
  }

  navToUserHome() {
    this.navToUrl('user');
  }

  navToProfile() {
    this.navToUrl('account/user');
  }

  navToTemplates() {
    this.navToUrl('templates');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  changeLanguage(lang: Language) {
    this.languageService.setLang(lang.key);
    this.currentLang = lang.key;

    if (lang.category === LanguageCategory.COMMUNITY) {
      const data: { [key: string]: string } = {
        dialogId: 'community-lang',
        headerLabel: 'dialog.you-are-using-community-lang',
        body: 'dialog.community-lang',
        confirmLabel: 'dialog.close',
        type: 'button-primary',
      };
      if (this.translateUrl) {
        data['additionalBody'] = 'dialog.contribute-to-lang';
        data['link'] = this.translateUrl + lang.key;
        data['linkText'] = 'dialog.translation-server';
      }
      this.dialog.open(BaseDialogComponent, {
        width: '400px',
        data: data,
      });
    }
  }

  isGuest(): boolean {
    return this.auth?.authProvider === AuthProvider.ARSNOVA_GUEST;
  }
}
