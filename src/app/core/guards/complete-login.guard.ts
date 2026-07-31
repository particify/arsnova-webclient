import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { map, tap } from 'rxjs';

export const completeLoginGuard: CanActivateFn = () => {
  const authenticationService = inject(AuthenticationService);
  const routingService = inject(RoutingService);
  const auth$ = authenticationService.completeLogin();
  return auth$.pipe(
    tap(() => {
      routingService.redirect();
    }),
    map(() => true)
  );
};
