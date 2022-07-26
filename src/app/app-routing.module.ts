import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { ExtensionRouteProvider, RouteMountPoint } from '../../projects/extension-point/src/lib/extension-route';
import { PageNotFoundComponent } from './components/shared/page-not-found/page-not-found.component';
import { HomePageComponent } from './components/home/home-page/home-page.component';
import { UserHomeComponent } from './components/home/user-home/user-home.component';
import { LoginComponent } from './components/home/login/login.component';
import { ImportComponent } from './components/home/import/import.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { RegisterComponent } from './components/home/register/register.component';
import { PasswordResetComponent } from './components/home/password-reset/password-reset.component';
import { RequestPasswordResetComponent } from './components/home/request-password-reset/request-password-reset.component';
import { ApiConfigResolver } from './resolver/api-config.resolver';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { DemoRoomGuard } from './guards/demo-room.guard';
import { RedeemTokenComponent } from './components/home/redeem-token/redeem-token.component';

const routes: Routes = [
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'password-reset/:email',
    component: PasswordResetComponent
  },
  {
    path: 'request-password-reset',
    component: RequestPasswordResetComponent
  },
  {
    path: 'user',
    canActivate: [AuthenticationGuard],
    component: UserHomeComponent
  },
  {
    path: 'join/:shortId',
    redirectTo: 'p/:shortId'
  },
  {
    path: 'import',
    canActivate: [AuthenticationGuard],
    component: ImportComponent
  },
  {
    path: 'redeem-token/:roomId/token/:token',
    canActivate: [AuthenticationGuard],
    component: RedeemTokenComponent
  },
  {
    path: 'demo',
    canActivate: [DemoRoomGuard],
    component: UserHomeComponent
  },
  {
    path: 'participant',
    redirectTo: 'p'
  },
  {
    path: 'creator',
    redirectTo: 'edit'
  },
  {
    path: 'presentation',
    redirectTo: 'present'
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./components/creator/creator.module').then(m => m.CreatorModule)
  },
  {
    path: 'p',
    loadChildren: () => import('./components/participant/participant.module').then(m => m.ParticipantModule)
  },
  {
    path: 'moderator',
    redirectTo: 'edit'
  },
  {
    path: 'present',
    loadChildren: () => import('./components/presentation/presentation.module').then(m => m.PresentationModule)
  }
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
            apiConfig: ApiConfigResolver
          },
          outlet: 'header',
          component: HeaderComponent
        },
        {
          path: '',
          resolve: {
            apiConfig: ApiConfigResolver
          },
          outlet: 'footer',
          component: FooterComponent
        },
        {
          path: '',
          resolve: {
            apiConfig: ApiConfigResolver
          },
          children: [
            ...routes,
            ...ExtensionRouteProvider.extractRoutesForMountPoint(
                RouteMountPoint.ROOT, extensionRouteProviders),
            {
              path: '**',
              component: PageNotFoundComponent
            }
          ]
        }
      ],
      deps: [ExtensionRouteProvider],
      multi: true
    }
  ]
})
export class AppRoutingModule {
}
