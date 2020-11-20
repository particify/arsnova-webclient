import { NgModule, APP_INITIALIZER, InjectionToken } from '@angular/core';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/home/register/register.component';
import { PasswordResetComponent } from './components/home/password-reset/password-reset.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from './services/http/user.service';
import { NotificationService } from './services/util/notification.service';
import { AuthenticationService } from './services/http/authentication.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { RoomMembershipService } from './services/room-membership.service';
import { RoomService } from './services/http/room.service';
import { CommentService } from './services/http/comment.service';
import { EventService } from './services/util/event.service';
import { ContentService } from './services/http/content.service';
import { ContentAnswerService } from './services/http/content-answer.service';
import { VoteService } from './services/http/vote.service';
import { WsConnectorService } from './services/websockets/ws-connector.service';
import { UserActivationComponent } from './components/home/_dialogs/user-activation/user-activation.component';
import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';
import { EssentialsModule } from './components/essentials/essentials.module';
import { SharedModule } from './components/shared/shared.module';
import { CreatorModule } from './components/creator/creator.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from './services/util/language.service';
import { HomePageComponent } from './components/home/home-page/home-page.component';
import { UserHomeComponent } from './components/home/user-home/user-home.component';
import { AppConfig } from './app.config';
import { ThemeModule } from '../theme/theme.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { extensions } from '../environments/extensions';
import { ModeratorService } from './services/http/moderator.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommentSettingsService } from './services/http/comment-settings.service';
import { BonusTokenService } from './services/http/bonus-token.service';
import { CustomIconService } from './services/util/custom-icon.service';
import { ModeratorModule } from './components/moderator/moderator.module';
import { ApiConfigService } from './services/http/api-config.service';
import { CookiesComponent } from './components/home/_dialogs/cookies/cookies.component';
import { OverlayComponent } from './components/home/_dialogs/overlay/overlay.component';
import { ArsModule } from '../../projects/ars/src/lib/ars.module';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './components/home/login/login.component';
import { DialogService } from './services/util/dialog.service';
import { DirectEntryComponent } from './components/shared/direct-entry/direct-entry.component';
import { ExtensionPointModule } from '../../projects/extension-point/src/lib/extension-point.module';
import { TrackingService } from './services/util/tracking.service';
import { AdminModule } from './components/admin/admin.module';
import { ImportComponent } from './components/home/import/import.component';
import { GlobalStorageService, STORAGE_CONFIG_PROVIDERS } from './services/util/global-storage.service';
import { ConsentService } from './services/util/consent.service';
import { ThemeService } from '../theme/theme.service';
import { RoomResolver } from './resolver/room.resolver';
import { ContentResolver } from './resolver/content.resolver';
import { CommentResolver } from './resolver/comment.resolver';
import { RoomViewUserRoleResolver } from './resolver/room-view-user-role.resolver';
import { ContentGroupService } from './services/http/content-group.service';
import { AnnounceService } from './services/util/announce.service';
import { AdminService } from './services/http/admin.service';
import { SystemInfoService } from './services/http/system-info.service';
import { RequestPasswordResetComponent } from './components/home/request-password-reset/request-password-reset.component';
import { FormattingService } from './services/http/formatting.service';
import { SnackBarAdvancedComponent } from './components/shared/snack-bar-advanced/snack-bar-advanced.component';
import { RoomUserRoleResolver } from './resolver/room-user-role.resolver';
import { RoutingService } from './services/util/routing.service';
import { TranslateHttpLoaderFactory } from './translate-http-loader-factory';
import { TRANSLATION_MODULE_NAME } from './translate-module-name-token';
import { FeedbackService } from './services/http/feedback.service';
import { UpdateService } from './services/util/update-service';

export function dialogClose(dialogResult: any) {
}

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
    DirectEntryComponent,
    CookiesComponent,
    OverlayComponent,
    ImportComponent,
    RequestPasswordResetComponent,
    SnackBarAdvancedComponent
  ],
  imports: [
    extensions,
    ExtensionPointModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    EssentialsModule,
    SharedModule,
    ThemeModule,
    MatIconModule,
    HttpClientModule,
    CreatorModule,
    ModeratorModule,
    AdminModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (TranslateHttpLoaderFactory),
        deps: [
          HttpClient,
          TRANSLATION_MODULE_NAME
        ]
      },
      isolate: true
    }),
    ArsModule
  ],
  providers: [
    /*AppConfig,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },*/
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthenticationService,
      deps: [AuthenticationService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    {
      provide: TRANSLATION_MODULE_NAME, useValue: 'home'
    },
    UpdateService,
    WsConnectorService,
    NotificationService,
    DialogService,
    AuthenticationService,
    AuthenticationGuard,
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
    BonusTokenService,
    ContentGroupService,
    CustomIconService,
    WsConnectorService,
    ApiConfigService,
    GlobalStorageService,
    ConsentService,
    TrackingService,
    ThemeService,
    RoomResolver,
    ContentResolver,
    CommentResolver,
    RoomViewUserRoleResolver,
    RoomUserRoleResolver,
    AnnounceService,
    AdminService,
    SystemInfoService,
    FormattingService,
    RoutingService,
    FeedbackService,
    { provide: Window,  useValue: window },
    STORAGE_CONFIG_PROVIDERS,
    {
      provide: MatDialogRef,
      useValue: {
        dialogClose
      }
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: []
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function initAuthenticationService(authenticationService: AuthenticationService) {
  return () => authenticationService.init();
}
