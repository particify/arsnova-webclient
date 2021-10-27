import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { UserRole } from '@arsnova/app/models/user-roles.enum';

export enum RoutePrefix {
  CREATOR = 'edit',
  PARTICIPANT = 'p',
  MODERATOR = 'moderator'
}

export const TITLES: { [key: string]: string } = {
  home: 'home',
  login: 'login',
  register: 'register',
  'request-password-reset': 'request-pw-reset',
  'password-reset/:email': 'pw-reset',
  user: 'user',
  '': 'room',
  import: 'import',
  comments: 'comments',
  'comments/moderation': 'comments',
  feedback: 'live-feedback',
  'series/:seriesName/statistics': 'series',
  'series/:seriesName': 'series',
  'series/:seriesName/:contentIndex': 'series',
  'series/:seriesName/edit/:contentId': 'content-edit',
  'series/:seriesName/create': 'content-creation',
  settings: 'settings',
  'settings/:settingsName': 'settings',
  archive: 'archive',
  admin: 'admin',
  status: 'admin',
  stats: 'admin',
  users: 'admin',
  rooms: 'admin'
};

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  seriesChildRoutes = [
    'series/:seriesName/create',
    'series/:seriesName/statistics'
  ];
  roomChildRoutes = [
    'feedback',
    'comments',
    'comments/moderation',
    'series/:seriesName'
  ];
  homeChildRoutes = [
    'user',
    'login'
  ];
  loginChildRoutes = [
    'register',
    'request-password-reset'
  ];
  parentRoute = {
    home: '',
    login: 'login',
    user: 'user',
  };
  currentRoute: string;
  backRoute: string[];
  fullCurrentRoute: string;
  redirectRoute: string;
  homeTitle: string;
  suffix: string;
  titleKey: string;
  isTranslatedTitle: boolean;

  constructor(
    private router: Router,
    private location: Location,
    private translateService: TranslateService,
    private langService: LanguageService) {
  }

  subscribeActivatedRoute() {
    this.router.events.pipe(
        filter(event => (event instanceof ActivationEnd)),
        filter(event => (event as ActivationEnd).snapshot.outlet === 'primary')
    ).subscribe((activationEndEvent: ActivationEnd) => {
      if (activationEndEvent.snapshot.component) {
        this.getRoutes(activationEndEvent.snapshot);
      }
    });
    this.langService.langEmitter.subscribe(lang => {
      if (this.isTranslatedTitle) {
        this.translateService.use(lang);
        this.translateService.get('title.' + this.titleKey).subscribe(msg => {
          this.updateTitle(msg);
        });
      }
    });
  }

  getRoutes(route: ActivatedRouteSnapshot) {
    const shortId = route.paramMap.get('shortId') || '';
    const series  = route.paramMap.get('seriesName') || '';
    const role = route.data.requiredRole || '';
    this.fullCurrentRoute = this.location.path();
    this.currentRoute = route.routeConfig.path;
    this.getBackRoute(this.currentRoute, shortId, role, series);
    this.setTitle(route);
  }

  getBackRoute(route: string, shortId: string, role: string, series: string) {
    let backRoute: string[];
    if (route === '') {
      backRoute = [this.parentRoute.user];
    } else if (this.routeExistsInArray(this.homeChildRoutes)) {
      backRoute = [this.parentRoute.home];
    } else if (this.routeExistsInArray(this.loginChildRoutes)) {
      backRoute = [this.parentRoute.login];
    } else if (this.routeExistsInArray(this.roomChildRoutes)) {
      backRoute = [this.getRoleString(role), shortId];
    } else if (this.routeExistsInArray(this.seriesChildRoutes)) {
      backRoute = [this.getRoleString(role), shortId, 'series', series];
    }
    this.backRoute = backRoute;
  }

  routeExistsInArray(routeList: string[]) {
    return routeList.indexOf(this.currentRoute) > -1;
  }

  goBack() {
    if (this.backRoute) {
      this.router.navigate(this.backRoute);
    } else {
      this.location.back();
    }
  }

  navigate(route: string) {
    this.router.navigateByUrl(route);
  }

  setRedirect(url?: string) {
    if (!this.redirectRoute) {
      if (!url) {
        url = this.fullCurrentRoute ?? this.location.path();
      }
      this.redirectRoute = url;
    }
  }

  redirect(): boolean {
    if (this.redirectRoute) {
      this.navigate(this.redirectRoute);
      this.redirectRoute = null;
      return true;
    } else {
      return false;
    }
  }

  getRoleString(role: string): string {
    let roleString;
    switch (role) {
      case UserRole.CREATOR:
        roleString = RoutePrefix.CREATOR;
        break;
      case UserRole.PARTICIPANT:
        roleString = RoutePrefix.PARTICIPANT;
        break;
      case UserRole.EXECUTIVE_MODERATOR:
        roleString = RoutePrefix.MODERATOR;
        break;
    }
    return roleString;
  }

  setTitle(route?: ActivatedRouteSnapshot) {
    if (!this.homeTitle) {
      this.homeTitle = document.title;
      this.suffix = ' | ' + (this.homeTitle.split('|')[0] || this.homeTitle);
    }
    let title: string;
    if (route.data.isPresentation) {
      this.titleKey = 'presentation-mode';
    } else if (route['_routerState'].url === '/')  {
      title = this.homeTitle;
    } else {
      this.titleKey = TITLES[route.routeConfig.path];
      switch(this.titleKey) {
        case 'room':
          if (route.data.room) {
            title = route.data.room.name;
          } else {
            this.titleKey = TITLES['admin'];
          }
          break;
        case 'series':
          title = route.params.seriesName;
          break;
        case undefined:
          title = this.homeTitle;
          break;
        default:
      }
    }
    if (!title) {
      this.isTranslatedTitle = true;
      this.translateService.get('title.' + this.titleKey).subscribe(msg => {
        this.updateTitle(msg);
      });
    } else {
      this.isTranslatedTitle = false;
      this.updateTitle(title)
    }
  }

  updateTitle(title: string) {
    if (title !== this.homeTitle) {
      title = title + this.suffix;
    }
    document.title = title;
  }

  isPresentation(url: string): boolean {
    return url.slice(1, 8).includes('present');
  }

  isAdminView(url: string): boolean {
    return url.slice(1, 6).includes('admin');
  }
}
