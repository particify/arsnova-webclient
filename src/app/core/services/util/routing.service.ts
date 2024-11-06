import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { UserRole } from '@app/core/models/user-roles.enum';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { ParentRoute } from '@app/core/models/parent-route';
import { ApiConfig } from '@app/core/models/api-config';
import { BehaviorSubject } from 'rxjs';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';

enum RoutePrefix {
  CREATOR = 'edit',
  PARTICIPANT = 'p',
  MODERATOR = 'moderator',
  PRESENTATION = 'present',
}

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private backRoute: string[] = [];
  private fullCurrentRoute?: string;
  private viewRole?: UserRole;
  private shortId?: string;
  private roomId?: string;
  private routingFeature?: RoutingFeature;
  role?: UserRole;
  role$ = new EventEmitter<UserRole>();
  isPreview = false;
  isPreview$ = new EventEmitter<boolean>();
  routeEvent = new EventEmitter<ActivatedRouteSnapshot>();
  seriesName?: string;
  showFooterLinks$ = new BehaviorSubject<boolean>(false);

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
        map((event) => event as ActivationEnd),
        filter((event) => event.snapshot.outlet === 'primary')
      )
      .subscribe((event) => {
        const snapshot = event.snapshot;
        if (snapshot.component) {
          this.getRoomUrlData(snapshot);
          this.getRoutes(snapshot);
          this.showFooterLinks$.next(snapshot.data.showFooterLinks);
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
    this.routingFeature = route.data.feature ?? this.routingFeature;
  }

  getRoutes(route: ActivatedRouteSnapshot) {
    this.routeEvent.emit(route);
    this.getBackRoute(route, route.data.requiredRole || null);
  }

  getBackRoute(route: ActivatedRouteSnapshot, role: UserRole) {
    if (!route.title) {
      return;
    }
    const parentRoute = route.data.parentRoute;
    if (parentRoute !== undefined) {
      if (parentRoute === ParentRoute.ROOM) {
        if (this.shortId) {
          this.backRoute = [this.getRoleRoute(role), this.shortId];
        }
      } else {
        this.backRoute = [parentRoute];
      }
    } else {
      this.backRoute = [];
    }
  }

  goBack() {
    if (this.backRoute.length > 0) {
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
      if (url) {
        this.setRedirectUrl(url);
      }
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

  getIsPreview(): EventEmitter<boolean> {
    return this.isPreview$;
  }

  navToPresentation(newTab = false) {
    if (!this.fullCurrentRoute) {
      return;
    }
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
    this.router.navigateByUrl(
      `/${this.isPreview ? RoutePrefix.CREATOR : RoutePrefix.PARTICIPANT}/${this.shortId}`
    );
  }

  replaceRoleInUrl(url: string, oldRole: string, newRole: string): string {
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

  getRoute(url: string[], config: ApiConfig): string {
    return (config.ui.links?.join?.url || document.baseURI) + url.join('/');
  }

  showFooterLinks(): BehaviorSubject<boolean> {
    return this.showFooterLinks$;
  }

  getRoutingFeature(): RoutingFeature | undefined {
    return this.routingFeature;
  }
}
