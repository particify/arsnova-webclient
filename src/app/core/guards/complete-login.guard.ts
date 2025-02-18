import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { map, tap } from 'rxjs';

export const completeLoginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);
  const routingService = inject(RoutingService);
  const auth$ = authenticationService.completeLogin();
  const redirect = routingService.getRedirectUrl() ?? '/user';
  return auth$.pipe(
    tap(() => router.navigateByUrl(redirect)),
    map(() => true)
  );
};
