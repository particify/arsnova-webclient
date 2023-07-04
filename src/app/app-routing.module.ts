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
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'login',
    data: {
      parentRoute: ParentRoute.HOME,
    },
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'register',
    data: {
      parentRoute: ParentRoute.LOGIN,
    },
  },
  {
    path: 'password-reset/:email',
    component: PasswordResetComponent,
    title: 'pw-reset',
  },
  {
    path: 'request-password-reset',
    component: RequestPasswordResetComponent,
    title: 'request-pw-reset',
    data: {
      parentRoute: ParentRoute.LOGIN,
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
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    title: 'admin',
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
    title: 'presentation-mode',
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
