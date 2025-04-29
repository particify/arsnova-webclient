import {
  ApplicationConfig,
  enableProdMode,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthenticationInterceptor } from '@app/core/interceptors/authentication.interceptor';
import { ServerTimeInterceptor } from '@app/core/interceptors/server-time.interceptor';
import { DefaultHeaderInterceptor } from '@app/core/interceptors/default-header.interceptor';
import { UpdateService } from '@app/core/services/util/update.service';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { AuthenticationGqlGuard } from '@app/core/guards/authentication-gql.guard';
import { DemoRoomGuard } from '@app/core/guards/demo-room.guard';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { EventService } from '@app/core/services/util/event.service';
import { RoomService } from '@app/core/services/http/room.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';
import { UserService } from '@app/core/services/http/user.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { ModeratorService } from '@app/core/services/http/moderator.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import {
  GlobalStorageService,
  STORAGE_CONFIG_PROVIDERS,
} from '@app/core/services/util/global-storage.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { RoomResolver } from '@app/core/resolver/room.resolver';
import { ContentResolver } from '@app/core/resolver/content.resolver';
import { CommentResolver } from '@app/core/resolver/comment.resolver';
import { RoomViewUserRoleResolver } from '@app/core/resolver/room-view-user-role.resolver';
import { RoomUserRoleResolver } from '@app/core/resolver/room-user-role.resolver';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { CachingService } from '@app/core/services/util/caching.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { DemoService } from '@app/core/services/demo.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AccessTokenService } from '@app/core/services/http/access-token.service';
import { RemoteService } from '@app/core/services/util/remote.service';
import { CommentSettingsResolver } from '@app/core/resolver/comment-settings.resolver';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TitleStrategy } from '@angular/router';
import { CustomPageTitleStrategy } from '@app/core/custom-title-strategy';
import { getBrowserLang } from '@jsverse/transloco';
import { extensions } from '@environments/extensions';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { CoreModule } from '@angular/flex-layout';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { MaterialCssVarsModule } from 'angular-material-css-vars';
import { AppErrorHandler } from '@app/app-error-handler';
import { ENVIRONMENT } from '@environments/environment-token';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ConsentService } from '@app/core/services/util/consent.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { WsRoomEventDispatcherService } from '@app/core/services/websockets/ws-room-event-dispatcher.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { environment } from '@environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { apolloProvider } from '@app/apollo-provider';

if (environment.production) {
  enableProdMode();
}

export const AppConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
    }),
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
    environment.graphql ? apolloProvider : [],
    provideAppInitializer(() => {
      const initializerFn = initAuthenticationService(
        inject(AuthenticationService)
      );
      return initializerFn();
    }),
    provideAppInitializer(() => {
      const initializerFn = initConsentService(
        inject(ConsentService),
        inject(ApiConfigService)
      );
      return initializerFn();
    }),
    provideAppInitializer(() => {
      const initializerFn = initWsRoomEventDispatcherService(
        inject(WsRoomEventDispatcherService)
      );
      return initializerFn();
    }),
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
    AuthenticationGqlGuard,
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
    importProvidersFrom(
      extensions,
      ExtensionPointModule.forRoot(),
      AppRoutingModule,
      CoreModule,
      TranslocoRootModule,
      MaterialCssVarsModule.forRoot({
        isAutoContrast: true,
        darkThemeClass: 'theme-dark',
        lightThemeClass: 'theme-light',
      })
    ),
  ],
};

function initAuthenticationService(
  authenticationService: AuthenticationService
) {
  return () => authenticationService.init();
}

function initConsentService(
  consentService: ConsentService,
  apiConfigService: ApiConfigService
) {
  return () => {
    apiConfigService
      .getApiConfig$()
      .subscribe((apiConfig) => consentService.init(apiConfig));
  };
}

function initWsRoomEventDispatcherService(
  wsRoomEventDispatcherService: WsRoomEventDispatcherService
) {
  return () => wsRoomEventDispatcherService.init();
}
