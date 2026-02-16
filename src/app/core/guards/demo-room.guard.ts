import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { AuthenticationGuard } from '@app/core/guards/authentication.guard';
import { DemoService } from '@app/core/services/demo.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

@Injectable()
export class DemoRoomGuard implements CanActivate {
  private authenticationGuard = inject(AuthenticationGuard);
  private demoService = inject(DemoService);
  private router = inject(Router);
  private globalStorageService = inject(GlobalStorageService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authenticationGuard.canActivate(route, state).pipe(
      mergeMap(() => {
        return this.demoService.createDemoRoom().pipe(
          tap(() =>
            this.globalStorageService.setItem(
              STORAGE_KEYS.EXPAND_ROOM_DESCRIPTION,
              true
            )
          ),
          mergeMap((shortId) => this.router.navigate(['edit', shortId]))
        );
      })
    );
  }
}
