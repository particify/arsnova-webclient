import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { AppComponent } from './app.component';
import { RegisterComponent } from '@app/core/components/register/register.component';
import { PasswordResetComponent } from '@app/core/components/password-reset/password-reset.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserService } from '@app/core/services/http/user.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { RoomService } from '@app/core/services/http/room.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { UserActivationComponent } from '@app/core/components//_dialogs/user-activation/user-activation.component';
import { AuthenticationInterceptor } from '@app/core/interceptors/authentication.interceptor';
import { CoreModule } from '@app/core/core.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';
import { HomePageComponent } from '@app/core/components/home-page/home-page.component';
import { UserHomeComponent } from '@app/core/components/user-home/user-home.component';
import { AppConfig } from './app.config';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environments/environment';
import { extensions } from '@environments/extensions';
import { ModeratorService } from '@app/core/services/http/moderator.service';
import { getBrowserLang } from '@jsverse/transloco';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { CookiesComponent } from '@app/core/components//_dialogs/cookies/cookies.component';
import { LoginComponent } from '@app/core/components/login/login.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { TrackingService } from '@app/core/services/util/tracking.service';
import {
  GlobalStorageService,
  STORAGE_CONFIG_PROVIDERS,
} from '@app/core/services/util/global-storage.service';
import { ConsentService } from '@app/core/services/util/consent.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { ContentResolver } from '@app/core/resolver/content.resolver';
import { CommentResolver } from '@app/core/resolver/comment.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { RequestPasswordResetComponent } from '@app/core/components/request-password-reset/request-password-reset.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { SnackBarAdvancedComponent } from '@app/core/components/snack-bar-advanced/snack-bar-advanced.component';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { CachingService } from '@app/core/services/util/caching.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { WsRoomEventDispatcherService } from '@app/core/services/websockets/ws-room-event-dispatcher.service';
import { DemoService } from '@app/core/services/demo.service';
import { DemoRoomGuard } from '@app/core/guards/demo-room.guard';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormHeaderComponent } from '@app/core/components/form-header/form-header.component';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AccessTokenService } from '@app/core/services/http/access-token.service';
import { RedeemTokenComponent } from '@app/core/components/redeem-token/redeem-token.component';
import { RemoteService } from '@app/core/services/util/remote.service';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { RoomJoinComponent } from '@app/core/components/room-join/room-join.component';
import { RoomListComponent } from '@app/core/components/room-list/room-list.component';
import { HotkeysComponent } from '@app/core/components/_dialogs/hotkeys/hotkeys.component';
import { HeaderComponent } from '@app/core/components/header/header.component';
import { FooterComponent } from './standalone/footer/footer.component';
import { UserProfileComponent } from '@app/core/components/user-profile/user-profile.component';
import { PageNotFoundComponent } from '@app/core/components/page-not-found/page-not-found.component';
import { UserFormFieldComponent } from '@app/core/components/user-profile/user-form-field/user-form-field.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { UpdateInfoComponent } from '@app/core/components/update-info/update-info.component';
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { RoomCreateComponent } from '@app/core/components/_dialogs/room-create/room-create.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { TitleStrategy } from '@angular/router';
import { CustomPageTitleStrategy } from '@app/core/custom-title-strategy';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { AppErrorHandler } from '@app/app-error-handler';
import { ENVIRONMENT } from '@environments/environment-token';
import { LoadingButtonComponent } from './standalone/loading-button/loading-button.component';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { FooterLinksComponent } from '@app/standalone/footer-links/footer-links.component';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { ServerTimeInterceptor } from '@app/core/interceptors/server-time.interceptor';
import { DefaultHeaderInterceptor } from '@app/core/interceptors/default-header.interceptor';
import { SplitButtonComponent } from '@app/standalone/split-button/split-button.component';
import { MenuItemDetailsComponent } from '@app/standalone/menu-item-details/menu-item-details.component';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PasswordResetComponent,
    RegisterComponent,
    UserActivationComponent,
    HomePageComponent,
    UserHomeComponent,
    CookiesComponent,
    RequestPasswordResetComponent,
    SnackBarAdvancedComponent,
    PasswordEntryComponent,
    FormHeaderComponent,
    RedeemTokenComponent,
    RoomJoinComponent,
    RoomListComponent,
    HotkeysComponent,
    HeaderComponent,
    UserProfileComponent,
    UserFormFieldComponent,
    PageNotFoundComponent,
    UpdateInfoComponent,
    RoomCreateComponent,
  ],
  imports: [
    extensions,
    ExtensionPointModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FooterComponent,
    LoadingButtonComponent,
    LoadingIndicatorComponent,
    SettingsPanelHeaderComponent,
    SettingsSlideToggleComponent,
    ListBadgeComponent,
    ContentGroupTemplateComponent,
    HintComponent,
    HttpClientModule,
    FooterLinksComponent,
    TextOverflowClipComponent,
    SplitButtonComponent,
    MenuItemDetailsComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    TranslocoRootModule,
    MaterialCssVarsModule.forRoot({
      isAutoContrast: true,
      darkThemeClass: 'theme-dark',
      lightThemeClass: 'theme-light',
    }),
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthenticationService,
      deps: [AuthenticationService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initConsentService,
      deps: [ConsentService, ApiConfigService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initWsRoomEventDispatcherService,
      deps: [WsRoomEventDispatcherService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerTimeInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DefaultHeaderInterceptor,
      multi: true,
    },
    UpdateService,
    WsConnectorService,
    NotificationService,
    DialogService,
    AuthenticationService,
    AuthenticationGuard,
    DemoRoomGuard,
    RoomMembershipService,
    EventService,
    RoomService,
    CommentService,
    ContentService,
    ContentAnswerService,
    LanguageService,
    UserService,
    VoteService,
    ModeratorService,
    CommentSettingsService,
    ContentGroupService,
    WsCommentService,
    ApiConfigService,
    GlobalStorageService,
    ConsentService,
    TrackingService,
    ThemeService,
    ApiConfigResolver,
    RoomResolver,
    ContentResolver,
    CommentResolver,
    RoomViewUserRoleResolver,
    RoomUserRoleResolver,
    AnnounceService,
    SystemInfoService,
    FormattingService,
    RoutingService,
    FeedbackService,
    CachingService,
    LocalFileService,
    LikertScaleService,
    RoomStatsService,
    DemoService,
    WsRoomEventDispatcherService,
    HotkeyService,
    PresentationService,
    AccessTokenService,
    RemoteService,
    CommentSettingsResolver,
    ContentPublishService,
    { provide: Window, useValue: window },
    STORAGE_CONFIG_PROVIDERS,
    {
      provide: MAT_DIALOG_DATA,
      useValue: [],
    },
    { provide: TitleStrategy, useClass: CustomPageTitleStrategy },
    {
      provide: BROWSER_LANG,
      useFactory: () => getBrowserLang(),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function initAuthenticationService(
  authenticationService: AuthenticationService
) {
  return () => authenticationService.init();
}

export function initConsentService(
  consentService: ConsentService,
  apiConfigService: ApiConfigService
) {
  return () =>
    apiConfigService
      .getApiConfig$()
      .subscribe((apiConfig) => consentService.init(apiConfig));
}

export function initWsRoomEventDispatcherService(
  wsRoomEventDispatcherService: WsRoomEventDispatcherService
) {
  return () => wsRoomEventDispatcherService.init();
}
