import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DemoService } from '../services/demo.service';
import { AuthenticationGuard } from './authentication.guard';

@Injectable()
export class DemoRoomGuard implements CanActivate {
  constructor(private demoService: DemoService,
              private authenticationGuard: AuthenticationGuard,
              private router: Router) {
  }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authenticationGuard.canActivate(route, state).pipe(
      mergeMap(() => {
        const demoRoom = this.demoService.createDemoRoom();
        return demoRoom.pipe(mergeMap(r => this.router.navigate(['creator/room', r.shortId])));
      })
    );
  }
}
