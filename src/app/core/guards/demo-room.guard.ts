import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { DemoService } from '@app/core/services/demo.service';

@Injectable()
export class DemoRoomGuard implements CanActivate {
  private authenticationGuard = inject(AuthenticationGuard);
  private demoService = inject(DemoService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authenticationGuard.canActivate(route, state).pipe(
      mergeMap(() => {
        return this.demoService
          .createDemoRoom()
          .pipe(mergeMap((shortId) => this.router.navigate(['edit', shortId])));
      })
    );
  }
}
