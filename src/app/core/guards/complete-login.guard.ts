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
  return auth$.pipe(
    tap(() => {
      if (!routingService.redirect()) {
        router.navigateByUrl('/user');
      }
    }),
    map(() => true)
  );
};
