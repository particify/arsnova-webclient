import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

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

  constructor(
    private router: Router,
    private location: Location) {
  }

  subscribeActivatedRoute() {
    this.router.events.pipe(filter(event => (event instanceof ActivationEnd))).subscribe((activationEndEvent: ActivationEnd) => {
      if (activationEndEvent.snapshot.component) {
        this.createBackRoute(activationEndEvent.snapshot);
      }
    });
  }

  createBackRoute(route: ActivatedRouteSnapshot) {
    const shortId = route.paramMap.get('shortId') || '';
    const role = route.data.requiredRole || '';
    this.currentRoute = route.routeConfig.path;
    this.getBackRoute(this.currentRoute, shortId, role.toString().toLowerCase());
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
      if (role.includes(this.moderator)) {
        role = this.moderator;
      }
      backRoute = role + this.parentRoute.room + shortId;
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
}
