import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { UserRole } from '../../models/user-roles.enum';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';

export enum RoutePrefix {
  CREATOR = 'edit',
  PARTICIPANT = 'p',
  MODERATOR = 'moderator',
  PRESENTATION = 'present'
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
  admin: 'admin',
  status: 'admin',
  stats: 'admin',
  users: 'admin',
  rooms: 'admin',
  'account/:accountSettingsName': 'account'
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
  backRouteIsSet = false;
  fullCurrentRoute: string;
  homeTitle: string;
  suffix: string;
  private title: string;
  private titleKey: string;
  private isTranslatedTitle: boolean;
  private viewRole: UserRole;
  private shortId: string;
  private roomId: string;
  role: UserRole;
  role$ = new EventEmitter<UserRole>();
  isRoom: boolean;
  isRoom$ = new EventEmitter<boolean>();
  isPreview: boolean;
  isPreview$ = new EventEmitter<boolean>();
  routeEvent = new EventEmitter<ActivatedRouteSnapshot>();
  seriesName: string;

  constructor(
    private router: Router,
    private location: Location,
    private translateService: TranslateService,
    private langService: LanguageService,
    private globalStorageService: GlobalStorageService) {
  }

  subscribeActivatedRoute() {
    this.router.events.pipe(
        filter(event => (event instanceof ActivationEnd)),
        filter(event => (event as ActivationEnd).snapshot.outlet === 'primary')
    ).subscribe((activationEndEvent: ActivationEnd) => {
      if (activationEndEvent.snapshot.component) {
        this.getRoomUrlData(activationEndEvent.snapshot);
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

  getRoomUrlData(route: ActivatedRouteSnapshot) {
    this.role = route.data.userRole;
    const series = route.params['seriesName'];
    if (series || route.data.room?.id !== this.roomId) {
      this.seriesName = series;
    }
    this.roomId = route.data.room?.id;
    this.role$.emit(this.role);
    this.viewRole = route.data.viewRole;
    this.shortId = route.params['shortId'];
    this.isPreview = this.role !== this.viewRole;
    this.isPreview$.emit(this.isPreview);
    this.isRoom = !!this.shortId;
    this.isRoom$.emit(this.isRoom);
  }

  getRoutes(route: ActivatedRouteSnapshot) {
    const series  = route.paramMap.get('seriesName') || '';
    const role = route.data.requiredRole || '';
    this.fullCurrentRoute = this.location.path();
    this.currentRoute = route.routeConfig.path;
    this.routeEvent.emit(route);
    this.getBackRoute(role, series, route.parent.routeConfig['path']);
    this.setTitle(route);
  }

  getBackRoute(role: string, series: string, parentRoute?: string) {
    const roomRoute = ':shortId';
    let backRoute: string[];
    if (this.currentRoute === '') {
      backRoute = [this.parentRoute.user];
    } else if (this.routeExistsInArray(this.homeChildRoutes)) {
      backRoute = [this.parentRoute.home];
    } else if (this.routeExistsInArray(this.loginChildRoutes)) {
      backRoute = [this.parentRoute.login];
    } else if (this.routeExistsInArray(this.roomChildRoutes)) {
      backRoute = [this.getRoleString(role), this.shortId];
    } else if (this.routeExistsInArray(this.seriesChildRoutes)) {
      backRoute = [this.getRoleString(role), this.shortId, 'series', series];
    }
    // Set back route if not set yet, parent route is a room route or if current route is no room route at all 
    if (!this.backRouteIsSet || parentRoute === roomRoute || this.currentRoute !== roomRoute) {
      this.backRoute = backRoute;
      this.backRouteIsSet = true;
    } else {
      this.backRouteIsSet = false;
    }
  }

  routeExistsInArray(routeList: string[]) {
    return routeList.includes(this.currentRoute);
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

  setRedirect(url?: string, checkIfAlreadyOnLogin = false) {
    const redirectRoute = this.getRedirectUrl();
    if (!redirectRoute) {
      if (!url && (checkIfAlreadyOnLogin && this.location.path() !== '/login')) {
        url = this.fullCurrentRoute ?? this.location.path();
      }
      this.setRedirectUrl(url);
    }
  }

  redirect(): boolean {
    const url = this.getRedirectUrl();
    if (url) {
      this.removeRedirectUrl();
      this.navigate(url);
      return true;
    } else {
      return false;
    }
  }

  getRedirectUrl(): string {
    return this.globalStorageService.getItem(STORAGE_KEYS.REDIRECT_URL);
  }

  setRedirectUrl(url: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.REDIRECT_URL, url);
  }

  removeRedirectUrl() {
    this.globalStorageService.removeItem(STORAGE_KEYS.REDIRECT_URL);
  }

  getRoleString(role: string): string {
    return role === UserRole.PARTICIPANT ? RoutePrefix.PARTICIPANT : RoutePrefix.CREATOR;
  }

  setTitle(route?: ActivatedRouteSnapshot) {
    if (!this.homeTitle) {
      this.homeTitle = document.title;
      this.suffix = ' | ' + (this.homeTitle.split('|')[0] || this.homeTitle);
    }
    this.isTranslatedTitle = true;
    let newTitle: string;
    if (route.data.isPresentation) {
      this.titleKey = 'presentation-mode';
    } else if (route['_routerState'].url === '/')  {
      newTitle = this.homeTitle;
      this.isTranslatedTitle = false;
    } else {
      if (TITLES[route.routeConfig.path]) {
        this.titleKey = TITLES[route.routeConfig.path];
      }
      if (!newTitle) {
        switch(this.titleKey) {
        case 'room':
          if (route.data.room) {
            newTitle = route.data.room.name;
            this.isTranslatedTitle = false;
          } else {
            this.titleKey = TITLES['admin'];
          }
          break;
        case 'series':
          newTitle = route.params.seriesName;
          this.isTranslatedTitle = false;
          break;
        case undefined:
          newTitle = this.homeTitle;
          break;
        default:
      }
      }

    }
    if (this.title !== newTitle && newTitle) {
      this.title = newTitle;
    }
    if (this.isTranslatedTitle) {
      this.translateService.get('title.' + this.titleKey).subscribe(msg => {
        this.updateTitle(msg);
      });
    } else {
      this.updateTitle(this.title);
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

  getRole(): EventEmitter<UserRole> {
    return this.role$;
  }

  getIsRoom(): EventEmitter<boolean> {
    return this.isRoom$;
  }

  getIsPreview(): EventEmitter<boolean> {
    return this.isPreview$;
  }

  navToPresentation(newTab = false) {
    const url = this.fullCurrentRoute.includes('/settings') ? this.getPresentationHomeUrl() : this.getPresentationUrl(this.fullCurrentRoute);
    if (newTab) {
      window.open(url, '_blank');
    } else {
      this.router.navigateByUrl(url);
    }
  }

  getPresentationHomeUrl(): string {
    return RoutePrefix.PRESENTATION + '/' + this.shortId;
  }

  getPresentationUrl(url: string): string {
    return this.replaceRoleInUrl(url, this.getRoleString(this.viewRole), RoutePrefix.PRESENTATION);
  }

  switchRole() {
    const currentRoleString = this.getRoleString(this.role);
    const url = '/' + (this.fullCurrentRoute.includes(currentRoleString) ? RoutePrefix.PARTICIPANT : currentRoleString) + '/' + this.shortId;
    this.router.navigateByUrl(url);
  }

  replaceRoleInUrl(url, oldRole, newRole): string {
    const reg = new RegExp(`\/${oldRole}+(\|$)`);
    return url.replace(reg, newRole);
  }

  navToSettings() {
    const url = `${RoutePrefix.CREATOR}/${this.shortId}/settings`;
    this.router.navigateByUrl(url);
  }

  getShortId() {
    return this.shortId;
  }

  getRoomId() {
    return this.roomId;
  }

  getRouteChanges(): EventEmitter<ActivatedRouteSnapshot> {
    return this.routeEvent;
  }
}
