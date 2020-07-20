import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/home/_dialogs/register/register.component';
import { PasswordResetComponent } from './components/home/_dialogs/password-reset/password-reset.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from './services/http/user.service';
import { NotificationService } from './services/util/notification.service';
import { AuthenticationService } from './services/http/authentication.service';
import { AuthenticationGuard } from './guards/authentication.guard';
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
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';
import { HomePageComponent } from './components/home/home-page/home-page.component';
import { UserHomeComponent } from './components/home/user-home/user-home.component';
import { AppConfig } from './app.config';
import { ThemeModule } from '../theme/theme.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ModeratorService } from './services/http/moderator.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
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
import { TrackingService } from './services/util/tracking.service';
import { AdminModule } from './components/admin/admin.module';
import { ImportComponent } from './components/home/import/import.component';
import { GlobalStorageService, STORAGE_CONFIG_PROVIDERS } from './services/util/global-storage.service';
import { ConsentService } from './services/util/consent.service';
import { ThemeService } from '../theme/theme.service';
import { RoomResolver } from './resolver/room.resolver';
import { ContentResolver } from './resolver/content.resolver';
import { CommentResolver } from './resolver/comment.resolver';
import { ContentGroupService } from './services/http/content-group.service';
import { AnnounceService } from './services/util/announce.service';
import { AdminService } from './services/http/admin.service';
import { SystemInfoService } from './services/http/system-info.service';

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
    ImportComponent
  ],
  imports: [
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
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          sanitize: true
        }
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
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
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    WsConnectorService,
    NotificationService,
    DialogService,
    AuthenticationService,
    AuthenticationGuard,
    EventService,
    RoomService,
    CommentService,
    ContentService,
    ContentAnswerService,
    LanguageService,
    MarkdownService,
    MarkedOptions,
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
    AnnounceService,
    AdminService,
    SystemInfoService,
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

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/home/', '.json');
}
