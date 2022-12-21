import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../services/util/routing.service';
import { AuthProvider } from '../../../models/auth-provider';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { RoomMembershipService } from '../../../services/room-membership.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  template: '',
})
export class RedeemTokenComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routingService: RoutingService,
    private authenticationService: AuthenticationService,
    private roomMembershipService: RoomMembershipService
  ) {}

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
          const roomId = this.route.snapshot.params.roomId;
          const token = this.route.snapshot.params.token;
          this.roomMembershipService
            .requestMembership(roomId, token)
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
