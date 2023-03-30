import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import {
  ExtensionRouteProvider,
  RouteMountPoint,
} from '@projects/extension-point/src/lib/extension-route';
import { PageNotFoundComponent } from '@core/components/page-not-found/page-not-found.component';
import { HomePageComponent } from '@core/components/home-page/home-page.component';
import { UserHomeComponent } from '@core/components/user-home/user-home.component';
import { LoginComponent } from '@core/components/login/login.component';
import { ImportComponent } from '@core/components/import/import.component';
import { AuthenticationGuard } from '@core/guards/authentication.guard';
import { RegisterComponent } from '@core/components/register/register.component';
import { PasswordResetComponent } from '@core/components/password-reset/password-reset.component';
import { RequestPasswordResetComponent } from '@core/components/request-password-reset/request-password-reset.component';
import { ApiConfigResolver } from '@core/resolver/api-config.resolver';
import { HeaderComponent } from '@core/components/header/header.component';
import { FooterComponent } from '@app/shared/_standalone/footer/footer.component';
import { DemoRoomGuard } from '@core/guards/demo-room.guard';
import { UserProfileComponent } from '@core/components/user-profile/user-profile.component';
import { RedeemTokenComponent } from '@core/components/redeem-token/redeem-token.component';

const routes: Routes = [
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'password-reset/:email',
    component: PasswordResetComponent,
  },
  {
    path: 'request-password-reset',
    component: RequestPasswordResetComponent,
  },
  {
    path: 'user',
    canActivate: [AuthenticationGuard],
    component: UserHomeComponent,
  },
  {
    path: 'join/:shortId',
    redirectTo: 'p/:shortId',
  },
  {
    path: 'import',
    canActivate: [AuthenticationGuard],
    component: ImportComponent,
  },
  {
    path: 'account/:accountSettingsName',
    component: UserProfileComponent,
  },
  {
    path: 'redeem-token/:roomId/token/:token',
    canActivate: [AuthenticationGuard],
    component: RedeemTokenComponent,
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
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'edit',
    loadChildren: () =>
      import('./creator/creator.module').then((m) => m.CreatorModule),
  },
  {
    path: 'p',
    loadChildren: () =>
      import('./participant/participant.module').then(
        (m) => m.ParticipantModule
      ),
  },
  {
    path: 'moderator',
    redirectTo: 'edit',
  },
  {
    path: 'present',
    loadChildren: () =>
      import('./presentation/presentation.module').then(
        (m) => m.PresentationModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot([], { paramsInheritanceStrategy: 'always' })],
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
