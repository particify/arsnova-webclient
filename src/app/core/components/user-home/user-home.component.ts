import { Component, OnInit, inject, input } from '@angular/core';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FlexModule } from '@angular/flex-layout';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { RoomListComponent } from '@app/core/components/room-list/room-list.component';
import { AsyncPipe } from '@angular/common';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { DialogService } from '@app/core/services/util/dialog.service';
import { Router } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  imports: [
    FlexModule,
    AutofocusDirective,
    RoomListComponent,
    AsyncPipe,
    A11yIntroPipe,
  ],
})
export class UserHomeComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  startVerification = input<boolean>(false);

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  auth!: AuthenticatedUser;

  ngOnInit() {
    this.authenticationService
      .getCurrentAuthentication()
      .pipe(first())
      .subscribe((auth) => {
        if (this.startVerification()) {
          this.router.navigate(['user'], { replaceUrl: true });
          this.dialogService
            .openUserActivationDialog(auth.userId)
            .afterClosed()
            .subscribe(() => {
              this.authenticationService.refetchCurrentUser();
            });
        }
        this.auth = auth;
      });
  }
}
