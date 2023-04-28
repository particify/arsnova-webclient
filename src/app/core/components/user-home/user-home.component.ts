import { AfterContentInit, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@app/core/services/util/language.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthenticationService } from '@app/core/services/http/authentication.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit, AfterContentInit {
  auth: ClientAuthentication;

  constructor(
    private translateService: TranslateService,
    protected langService: LanguageService,
    private authenticationService: AuthenticationService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('user-message').focus();
    }, 500);
  }

  ngOnInit() {
    this.authenticationService
      .getCurrentAuthentication()
      .subscribe((auth) => (this.auth = auth));
  }
}
