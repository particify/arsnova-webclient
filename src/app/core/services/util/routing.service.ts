import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { UserRole } from '@app/core/models/user-roles.enum';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';

export enum RoutePrefix {
  CREATOR = 'edit',
  PARTICIPANT = 'p',
  MODERATOR = 'moderator',
  PRESENTATION = 'present',
}

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  seriesChildRoutes = [
    'series/:seriesName/create',
    'series/:seriesName/statistics',
  ];
  roomChildRoutes = [
    'feedback',
    'comments',
    'comments/moderation',
    'series/:seriesName',
  ];
  homeChildRoutes = ['user', 'login'];
  loginChildRoutes = ['register', 'request-password-reset'];
  parentRoute = {
    home: '',
    login: 'login',
    user: 'user',
  };
  currentRoute: string;
  backRoute: string[];
  backRouteIsSet = false;
  fullCurrentRoute: string;
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
    private globalStorageService: GlobalStorageService
  ) {
    this.location.onUrlChange((url) => {
      this.fullCurrentRoute = url;
    });
  }

  subscribeActivatedRoute() {
    this.router.events
      .pipe(
        filter((event) => event instanceof ActivationEnd),
        filter(
          (event) => (event as ActivationEnd).snapshot.outlet === 'primary'
        )
      )
      .subscribe((activationEndEvent: ActivationEnd) => {
        if (activationEndEvent.snapshot.component) {
          this.getRoomUrlData(activationEndEvent.snapshot);
          this.getRoutes(activationEndEvent.snapshot);
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
    const series = route.paramMap.get('seriesName') || '';
    const role = route.data.requiredRole || '';
    this.currentRoute = route.routeConfig.path;
    this.routeEvent.emit(route);
    this.getBackRoute(role, series, route.parent.routeConfig['path']);
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
      backRoute = [this.getRoleRoute(role), this.shortId];
    } else if (this.routeExistsInArray(this.seriesChildRoutes)) {
      backRoute = [this.getRoleRoute(role), this.shortId, 'series', series];
    }
    // Set back route if not set yet, parent route is a room route or if current route is no room route at all
    if (
      !this.backRouteIsSet ||
      parentRoute === roomRoute ||
      this.currentRoute !== roomRoute
    ) {
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
      if (!url && checkIfAlreadyOnLogin && this.location.path() !== '/login') {
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

  getRoleRoute(role?: string): string {
    if (!role) {
      if (this.role) {
        role = this.role;
      } else {
        return RoutePrefix.PRESENTATION;
      }
    }
    return role === UserRole.PARTICIPANT
      ? RoutePrefix.PARTICIPANT
      : RoutePrefix.CREATOR;
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
    const url = this.fullCurrentRoute.includes('/settings')
      ? this.getPresentationHomeUrl()
      : this.getPresentationUrl(this.fullCurrentRoute);
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
    return this.replaceRoleInUrl(
      url,
      this.getRoleRoute(this.viewRole),
      RoutePrefix.PRESENTATION
    );
  }

  switchRole() {
    const currentRoleString = this.getRoleRoute(this.role);
    const url =
      '/' +
      (this.fullCurrentRoute.includes(currentRoleString)
        ? RoutePrefix.PARTICIPANT
        : currentRoleString) +
      '/' +
      this.shortId;
    this.router.navigateByUrl(url);
  }

  replaceRoleInUrl(url, oldRole, newRole): string {
    const reg = new RegExp(`/${oldRole}+(|$)`);
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

  getRoomJoinUrl(joinUrl?: string): string {
    return (joinUrl || document.baseURI + 'p/') + this.shortId;
  }

  removeProtocolFromUrl(url: string): string {
    return url.replace(/^https?:\/\//, '');
  }
}
