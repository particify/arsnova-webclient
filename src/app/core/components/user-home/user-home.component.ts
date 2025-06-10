import { Component, OnInit, inject } from '@angular/core';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FlexModule } from '@angular/flex-layout';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { RoomListComponent } from '@app/core/components/room-list/room-list.component';
import { AsyncPipe } from '@angular/common';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';

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

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  auth!: ClientAuthentication;

  ngOnInit() {
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.auth = auth));
  }
}
