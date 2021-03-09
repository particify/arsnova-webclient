import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

export const TITLES: { [key: string]: string } = {
  home: 'home',
  login: 'login',
  register: 'register',
  'request-password-reset': 'request-pw-reset',
  'password-reset/:email': 'pw-reset',
  user: 'user',
  import: 'import',
  '': 'room',
  comments: 'comments',
  'moderator/comments': 'moderation',
  survey: 'live-survey',
  statistics: 'statistics',
  'group/:contentGroup/statistics': 'presentation',
  'create-content': 'content-creation',
  settings: 'settings',
  edit: 'content-edit',
  group: 'content-group',
  'group/:contentGroup': 'content-group',
  'group/:contentGroup/statistics/:contentIndex': 'content-group'
};

@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  roomChildRoutes = [
    'survey',
    'comments',
    'group/:contentGroup',
    'group/:contentGroup/:contentIndex'
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
    home: '/home',
    login: '/login',
    user: '/user',
    room: '/room/'
  };
  moderator = 'moderator';
  currentRoute: string;
  backRoute: string;
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
    const role = route.data.requiredRole || '';
    this.fullCurrentRoute = this.location.path();
    this.currentRoute = route.routeConfig.path;
    this.getBackRoute(this.currentRoute, shortId, role);
    this.setTitle(route);
  }

  getBackRoute(route: string, shortId: string, role: string) {
    let backRoute: string;
    if (route === '') {
      backRoute = this.parentRoute.user;
    } else if (this.routeExistsInArray(this.homeChildRoutes)) {
      backRoute = this.parentRoute.home;
    } else if (this.routeExistsInArray(this.loginChildRoutes)) {
      backRoute = this.parentRoute.login;
    } else if (this.routeExistsInArray(this.roomChildRoutes)) {
      backRoute = this.getRoleString(role) + this.parentRoute.room + shortId;
    }
    this.backRoute = backRoute;
  }

  routeExistsInArray(routeList: string[]) {
    return routeList.indexOf(this.currentRoute) > -1;
  }

  goBack() {
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else {
      this.location.back();
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  setRedirect() {
    this.redirectRoute = this.fullCurrentRoute;
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
    const lowerCaseRole = role.toLowerCase();
    if (lowerCaseRole.includes(this.moderator)) {
      return this.moderator;
    } else {
      return lowerCaseRole;
    }
  }

  setTitle(route?: ActivatedRouteSnapshot) {
    if (!this.homeTitle) {
      this.homeTitle = document.title;
      this.suffix = ' | ' + (this.homeTitle.split('|')[0] || this.homeTitle);
    }
    this.titleKey = TITLES[route.routeConfig.path];
    let title: string;
    switch(this.titleKey) {
      case 'room':
        title = route.data.room.name;
        break;
      case 'content-group':
        title = route.params.contentGroup;
        break;
      case 'home':
        title = this.homeTitle;
        break;
      default:
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
}
