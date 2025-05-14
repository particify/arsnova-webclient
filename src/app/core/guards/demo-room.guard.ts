import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DemoService } from '@app/core/services/demo.service';
import { AuthenticationGuard } from './authentication.guard';

@Injectable()
export class DemoRoomGuard implements CanActivate {
  private demoService = inject(DemoService);
  private authenticationGuard = inject(AuthenticationGuard);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authenticationGuard.canActivate(route, state).pipe(
      mergeMap(() => {
        const demoRoom = this.demoService.createDemoRoom();
        return demoRoom.pipe(
          mergeMap((r) => this.router.navigate(['edit', r.shortId]))
        );
      })
    );
  }
}
