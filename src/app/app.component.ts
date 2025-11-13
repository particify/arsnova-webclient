import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { LanguageService } from '@app/core/services/util/language.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { RoomService } from '@app/core/services/http/room.service';
import { DrawerService } from '@app/core/services/util/drawer.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { Language } from '@app/core/models/language';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { UiConfig } from '@app/core/models/api-config';
import { UiService } from '@app/core/services/util/ui.service';
import { CoreModule } from './core/core.module';
import { FooterLinksComponent } from './standalone/footer-links/footer-links.component';
import { GlobalHintsContainerComponent } from './standalone/global-hints/global-hints-container/global-hints-container.component';
import { GlobalHintsService } from './standalone/global-hints/global-hints.service';
import { GlobalHintType } from './standalone/global-hints/global-hint';
import { DialogService } from './core/services/util/dialog.service';
import { ExtensionPointComponent } from '@projects/extension-point/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CoreModule,
    FooterLinksComponent,
    RouterOutlet,
    GlobalHintsContainerComponent,
    ExtensionPointComponent,
    RouterLink,
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  private languageService = inject(LanguageService);
  private apiConfigService = inject(ApiConfigService);
  private trackingService = inject(TrackingService);
  private updateService = inject(UpdateService);
  private routingService = inject(RoutingService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private roomService = inject(RoomService);
  private drawerService = inject(DrawerService);
  private themeService = inject(ThemeService);
  private authenticationService = inject(AuthenticationService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslocoService);
  private dialog = inject(MatDialog);
  private featureFlagService = inject(FeatureFlagService);
  private uiService = inject(UiService);
  private globalHintsService = inject(GlobalHintsService);
  private dialogService = inject(DialogService);

  constructor() {
    const themeService = this.themeService;
    this.currentTheme = themeService.getCurrentTheme();
    this.themes = this.themeService.getThemes();
    this.langs = this.languageService.getLangs();
  }
  @ViewChild('mainDrawer') drawer!: MatDrawer;

  title = 'ARSnova';
  isStandalone = false;
  isAdmin = false;
  isRoom = false;
  auth?: AuthenticatedUser;
  userCharacter?: string;
  uiConfig?: UiConfig;
  currentLang?: string;
  langs: Language[] = [];
  translateUrl?: string;
  currentTheme?: string;
  themes: string[] = [];
  contentGroupTemplatesActive = false;
  allowRegister = false;

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
      if (config.readOnly) {
        this.globalHintsService.addHint({
          id: 'readonly-hint',
          type: GlobalHintType.WARNING,
          message: 'general.read-only-mode-active',
          icon: 'warning',
          translate: true,
        });
      }
      this.allowRegister = !config.ui.registrationDisabled;
    });
    this.roomService.getCurrentRoomStream().subscribe((room) => {
      this.isRoom = !!room;
    });
    this.authenticationService
      .getAuthenticatedUserChanges()
      .subscribe((auth) => {
        this.auth = auth;
        this.userCharacter = this.auth?.displayId
          ?.slice(0, 1)
          .toLocaleUpperCase();
        if (auth && auth.unverifiedMailAddress && !auth.verified) {
          this.globalHintsService.addHint({
            id: 'verify-hint',
            type: GlobalHintType.CUSTOM,
            icon: 'verified',
            message: 'user-activation.verify-mail-to-use-all-features',
            action: () => this.openVerifyDialog(),
            actionLabel: 'user-activation.verify-mail',
            dismissible: true,
            translate: true,
          });
        }
      });
    this.currentLang = this.translationService.getActiveLang();
    this.contentGroupTemplatesActive = this.featureFlagService.isEnabled(
      'CONTENT_GROUP_TEMPLATES'
    );
    this.uiService.setScrollbarWidthVariable();
  }

  openVerifyDialog() {
    if (this.auth) {
      const dialogRef = this.dialogService.openUserActivationDialog(
        this.auth.userId
      );
      dialogRef.afterClosed().subscribe((result?: { success: boolean }) => {
        this.authenticationService.refetchCurrentUser();
        if (result?.success) {
          this.globalHintsService.removeHint('verify-hint');
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.drawerService.setDrawer(this.drawer);
  }

  checkRoute(url: string) {
    this.isStandalone =
      this.routingService.isPresentation(url) ||
      url.slice(1, 6).includes('embed');
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
    return !this.auth?.verified;
  }
}
