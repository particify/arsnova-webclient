import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { RegisterComponent } from '@core/components/register/register.component';
import { PasswordResetComponent } from '@core/components/password-reset/password-reset.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { UserService } from './core/services/http/user.service';
import { NotificationService } from './core/services/util/notification.service';
import { AuthenticationService } from './core/services/http/authentication.service';
import { AuthenticationGuard } from './core/guards/authentication.guard';
import { RoomMembershipService } from './core/services/room-membership.service';
import { RoomService } from './core/services/http/room.service';
import { CommentService } from './core/services/http/comment.service';
import { EventService } from './core/services/util/event.service';
import { ContentService } from './core/services/http/content.service';
import { ContentAnswerService } from './core/services/http/content-answer.service';
import { VoteService } from './core/services/http/vote.service';
import { WsConnectorService } from './core/services/websockets/ws-connector.service';
import { UserActivationComponent } from '@core/components//_dialogs/user-activation/user-activation.component';
import { AuthenticationInterceptor } from './core/interceptors/authentication.interceptor';
import { CoreModule } from './core/core.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from './core/services/util/language.service';
import { HomePageComponent } from '@core/components/home-page/home-page.component';
import { UserHomeComponent } from '@core/components/user-home/user-home.component';
import { AppConfig } from './app.config';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environments/environment';
import { extensions } from '@environments/extensions';
import { ModeratorService } from './core/services/http/moderator.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommentSettingsService } from './core/services/http/comment-settings.service';
import { ApiConfigService } from './core/services/http/api-config.service';
import { CookiesComponent } from '@core/components//_dialogs/cookies/cookies.component';
import { LoginComponent } from '@core/components/login/login.component';
import { DialogService } from './core/services/util/dialog.service';
import { ExtensionPointModule } from '@projects/extension-point/src/lib/extension-point.module';
import { TrackingService } from './core/services/util/tracking.service';
import { ImportComponent } from '@core/components/import/import.component';
import {
  GlobalStorageService,
  STORAGE_CONFIG_PROVIDERS,
} from './core/services/util/global-storage.service';
import { ConsentService } from './core/services/util/consent.service';
import { ThemeService } from './core/theme/theme.service';
import { ApiConfigResolver } from './core/resolver/api-config.resolver';
import { RoomResolver } from './core/resolver/room.resolver';
import { ContentResolver } from './core/resolver/content.resolver';
import { CommentResolver } from './core/resolver/comment.resolver';
import { RoomViewUserRoleResolver } from './core/resolver/room-view-user-role.resolver';
import { ContentGroupService } from './core/services/http/content-group.service';
import { AnnounceService } from './core/services/util/announce.service';
import { SystemInfoService } from './core/services/http/system-info.service';
import { RequestPasswordResetComponent } from '@core/components/request-password-reset/request-password-reset.component';
import { FormattingService } from './core/services/http/formatting.service';
import { SnackBarAdvancedComponent } from './core/components/snack-bar-advanced/snack-bar-advanced.component';
import { RoomUserRoleResolver } from './core/resolver/room-user-role.resolver';
import { RoutingService } from './core/services/util/routing.service';
import { TranslateHttpLoaderFactory } from './translate-http-loader-factory';
import { TRANSLATION_MODULE_NAME } from './translate-module-name-token';
import { FeedbackService } from './core/services/http/feedback.service';
import { UpdateService } from './core/services/util/update.service';
import { CachingService } from './core/services/util/caching.service';
import { LocalFileService } from './core/services/util/local-file.service';
import { LikertScaleService } from './core/services/util/likert-scale.service';
import { RoomStatsService } from './core/services/http/room-stats.service';
import { WsRoomEventDispatcherService } from './core/services/websockets/ws-room-event-dispatcher.service';
import { DemoService } from './core/services/demo.service';
import { DemoRoomGuard } from './core/guards/demo-room.guard';
import { HotkeyService } from './core/services/util/hotkey.service';
import { PasswordEntryComponent } from '@core/components/password-entry/password-entry.component';
import { FormHeaderComponent } from '@core/components/form-header/form-header.component';
import { WsCommentService } from './core/services/websockets/ws-comment.service';
import { PresentationService } from './core/services/util/presentation.service';
import { AccessTokenService } from './core/services/http/access-token.service';
import { RedeemTokenComponent } from '@core/components/redeem-token/redeem-token.component';
import { RemoteService } from './core/services/util/remote.service';
import { CommentSettingsResolver } from './core/resolver/comment-settings.resolver';
import { ContentPublishService } from './core/services/util/content-publish.service';
import { RoomJoinComponent } from './core/components/room-join/room-join.component';
import { RoomListComponent } from './core/components/room-list/room-list.component';
import { HotkeysComponent } from './core/components/_dialogs/hotkeys/hotkeys.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './shared/_standalone/footer/footer.component';
import { UserProfileComponent } from './core/components/user-profile/user-profile.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { UserFormFieldComponent } from './core/components/user-profile/user-form-field/user-form-field.component';
import { SettingsPanelHeaderComponent } from './core/components/settings-panel-header/settings-panel-header.component';
import { SettingsSlideToggleComponent } from './core/components/settings-slide-toggle/settings-slide-toggle.component';
import { LoadingIndicatorComponent } from './shared/_standalone/loading-indicator/loading-indicator.component';

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
    ImportComponent,
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
    SettingsPanelHeaderComponent,
    SettingsSlideToggleComponent,
  ],
  imports: [
    extensions,
    ExtensionPointModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FooterComponent,
    LoadingIndicatorComponent,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient, TRANSLATION_MODULE_NAME],
      },
      isolate: true,
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthenticationService,
      deps: [AuthenticationService],
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
      provide: TRANSLATION_MODULE_NAME,
      useValue: 'home',
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function initAuthenticationService(
  authenticationService: AuthenticationService
) {
  return () => authenticationService.init();
}

export function initWsRoomEventDispatcherService(
  wsRoomEventDispatcherService: WsRoomEventDispatcherService
) {
  return () => wsRoomEventDispatcherService.init();
}
