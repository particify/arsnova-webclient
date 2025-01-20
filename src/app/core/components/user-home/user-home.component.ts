import { Component, OnInit } from '@angular/core';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthenticationService } from '@app/core/services/http/authentication.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  standalone: false,
})
export class UserHomeComponent implements OnInit {
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  auth!: ClientAuthentication;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.auth = auth));
  }
}
