import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { AuthProvider } from '@app/core/models/auth-provider';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { Subject, takeUntil } from 'rxjs';

@Component({ template: '' })
export class RedeemTokenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private routingService = inject(RoutingService);
  private authenticationService = inject(AuthenticationService);
  private roomMembershipService = inject(RoomMembershipService);

  // Route data input below
  @Input({ required: true }) roomId!: string;
  @Input({ required: true }) token!: string;

  destroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.authenticationService
      .getAuthenticationChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        if (!!auth && auth.authProvider !== AuthProvider.ARSNOVA_GUEST) {
          this.roomMembershipService
            .requestMembership(this.roomId, this.token)
            .subscribe(() => {
              this.router.navigate(['user']);
            });
        } else {
          this.routingService.setRedirect(this.router.url);
          this.router.navigate(['login']);
        }
      });
  }
}
