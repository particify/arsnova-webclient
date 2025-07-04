import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { PageNotFoundComponent } from '@app/core/components/page-not-found/page-not-found.component';
import { HomePageComponent } from '@app/core/components/home-page/home-page.component';
import { UserHomeComponent } from '@app/core/components/user-home/user-home.component';
import { LoginComponent } from '@app/core/components/login/login.component';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { RegisterComponent } from '@app/core/components/register/register.component';
import { PasswordResetComponent } from '@app/core/components/password-reset/password-reset.component';
import { RequestPasswordResetComponent } from '@app/core/components/request-password-reset/request-password-reset.component';
import { ApiConfigResolver } from '@app/core/resolver/api-config.resolver';
import { HeaderComponent } from '@app/core/components/header/header.component';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { DemoRoomGuard } from '@app/core/guards/demo-room.guard';
import { UserProfileComponent } from '@app/core/components/user-profile/user-profile.component';
import { RedeemTokenComponent } from '@app/core/components/redeem-token/redeem-token.component';
import { ParentRoute } from '@app/core/models/parent-route';
import { ContentGroupTemplateSelectionComponent } from '@app/standalone/content-group-template-selection/content-group-template-selection.component';
import { ContentGroupTemplatePreviewComponent } from '@app/standalone/content-group-template-preview/content-group-template-preview.component';
import { completeLoginGuard } from '@app/core/guards/complete-login.guard';
import { provideTranslocoScope } from '@jsverse/transloco';
import { DialogService } from './core/services/util/dialog.service';
import { FocusModeService } from './creator/_services/focus-mode.service';
import { TemplateService as CreatorTemplateService } from './creator/_services/template.service';
import { TemplateService as AdminTemplateService } from '@app/admin/template-management/template.service';
import { AdminService } from './core/services/http/admin.service';
import { ContentCarouselService } from './core/services/util/content-carousel.service';

const routes: Routes = [
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomePageComponent,
    title: 'home',
    data: {
      showFooterLinks: true,
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'login',
    data: {
      parentRoute: ParentRoute.HOME,
      showFooterLinks: true,
    },
  },
  {
    path: 'login/complete',
    component: LoginComponent,
    canActivate: [completeLoginGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'register',
    data: {
      parentRoute: ParentRoute.LOGIN,
      showFooterLinks: true,
    },
  },
  {
    path: 'password-reset/:email',
    component: PasswordResetComponent,
    title: 'pw-reset',
    data: {
      showFooterLinks: true,
    },
  },
  {
    path: 'request-password-reset',
    component: RequestPasswordResetComponent,
    title: 'request-pw-reset',
    data: {
      parentRoute: ParentRoute.LOGIN,
      data: {
        showFooterLinks: true,
      },
    },
  },
  {
    path: 'user',
    canActivate: [AuthenticationGuard],
    component: UserHomeComponent,
    title: 'user',
    data: {
      parentRoute: ParentRoute.HOME,
    },
  },
  {
    path: 't',
    redirectTo: 'templates',
  },
  {
    path: 'templates',
    component: ContentGroupTemplateSelectionComponent,
    title: 'templates',
  },
  {
    path: 'templates/my',
    component: ContentGroupTemplateSelectionComponent,
    title: 'templates',
    data: {
      showMyTemplates: true,
    },
  },
  {
    path: 'templates/:templateId',
    component: ContentGroupTemplatePreviewComponent,
    title: 'templates',
  },

  {
    path: 'join/:shortId',
    redirectTo: 'p/:shortId',
  },
  {
    path: 'account/:accountSettingsName',
    component: UserProfileComponent,
    title: 'account',
  },
  {
    path: 'redeem-token/:roomId/token/:token',
    canActivate: [AuthenticationGuard],
    component: RedeemTokenComponent,
    title: 'redeem-token',
  },
  {
    path: 'demo',
    canActivate: [DemoRoomGuard],
    component: UserHomeComponent,
  },
  {
    path: 'participant',
    redirectTo: 'p',
  },
  {
    path: 'creator',
    redirectTo: 'edit',
  },
  {
    path: 'presentation',
    redirectTo: 'present',
  },
  {
    path: 'admin',
    providers: [
      provideTranslocoScope('admin'),
      AdminService,
      AdminTemplateService,
      DialogService,
    ],
    loadChildren: () =>
      import('./admin/admin-routing.module').then((m) => m.AdminRoutingModule),
    title: 'admin',
  },
  {
    path: 'edit',
    providers: [
      provideTranslocoScope('creator'),
      DialogService,
      FocusModeService,
      CreatorTemplateService,
    ],
    loadChildren: () =>
      import('./creator/creator-routing.module').then(
        (m) => m.CreatorRoutingModule
      ),
  },
  {
    path: 'p',
    providers: [provideTranslocoScope('participant'), ContentCarouselService],
    loadChildren: () =>
      import('./participant/participant-routing.module').then(
        (m) => m.ParticipantRoutingModule
      ),
    data: {
      skipConsent: true,
    },
  },
  {
    path: 'moderator',
    redirectTo: 'edit',
  },
  {
    path: 'present',
    providers: [provideTranslocoScope('creator'), FocusModeService],
    loadChildren: () =>
      import('./presentation/presentation-routing.module').then(
        (m) => m.PresentationRoutingModule
      ),
    title: 'presentation-mode',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot([], {
      paramsInheritanceStrategy: 'always',
      bindToComponentInputs: true,
    }),
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: ROUTES,
      useFactory: (extensionRouteProviders: ExtensionRouteProvider[]) => [
        {
          path: '',
          resolve: {
            apiConfig: ApiConfigResolver,
          },
          outlet: 'header',
          component: HeaderComponent,
        },
        {
          path: '',
          resolve: {
            apiConfig: ApiConfigResolver,
          },
          outlet: 'footer',
          component: FooterComponent,
        },
        {
          path: '',
          resolve: {
            apiConfig: ApiConfigResolver,
          },
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
              RouteMountPoint.ROOT,
              extensionRouteProviders
            ),
            {
              path: '**',
              component: PageNotFoundComponent,
            },
          ],
        },
      ],
      deps: [ExtensionRouteProvider],
      multi: true,
    },
  ],
})
export class AppRoutingModule {}
