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
import { DataStoreService } from './services/util/data-store.service';
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
import { HomeActionsComponent } from './components/home/home-actions/home-actions.component';
import { HomePageComponent } from './components/home/home-page/home-page.component';
import { UserHomeComponent } from './components/home/user-home/user-home.component';
import { AppConfig } from './app.config';
import { ThemeModule } from '../theme/theme.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ModeratorService } from './services/http/moderator.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IntroductionComponent } from './components/home/_dialogs/introduction/introduction.component';
import { CommentSettingsService } from './services/http/comment-settings.service';
import { BonusTokenService } from './services/http/bonus-token.service';
import { CustomIconService } from './services/util/custom-icon.service';
import { ModeratorModule } from './components/moderator/moderator.module';
import { ImprintComponent } from './components/home/_dialogs/imprint/imprint.component';
import { ApiConfigService } from './services/http/api-config.service';
import { DataProtectionComponent } from './components/home/_dialogs/data-protection/data-protection.component';
import { CookiesComponent } from './components/home/_dialogs/cookies/cookies.component';
import { CookiesEnComponent } from '../assets/i18n/cookies/cookies-en';
import { CookiesDeComponent } from '../assets/i18n/cookies/cookies-de';
import { OverlayComponent } from './components/home/_dialogs/overlay/overlay.component';
import { DemoDeComponent } from '../assets/i18n/demo/demo-de';
import { DemoEnComponent } from '../assets/i18n/demo/demo-en';
import { ArsModule } from '../../projects/ars/src/lib/ars.module';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './components/home/_dialogs/login/login.component';

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
    HomeActionsComponent,
    HomePageComponent,
    IntroductionComponent,
    UserHomeComponent,
    ImprintComponent,
    DataProtectionComponent,
    CookiesComponent,
    CookiesEnComponent,
    CookiesDeComponent,
    DemoDeComponent,
    DemoEnComponent,
    OverlayComponent
  ],
  entryComponents: [
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent,
    UserActivationComponent,
    IntroductionComponent,
    CookiesComponent,
    OverlayComponent
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
    AuthenticationService,
    AuthenticationGuard,
    DataStoreService,
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
    CustomIconService,
    WsConnectorService,
    ApiConfigService,
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
