import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { UiConfig } from '@app/core/models/api-config';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ConsentService } from '@app/core/services/util/consent.service';

@Component({
  selector: 'app-footer-links',
  imports: [CoreModule, RouterModule],
  templateUrl: './footer-links.component.html',
  styleUrl: './footer-links.component.scss',
})
export class FooterLinksComponent implements OnInit {
  @Input() auth?: ClientAuthentication;
  @Input({ required: true }) uiConfig!: UiConfig;
  @Input() showHelp = false;
  @Output() inAppLinkClicked = new EventEmitter<void>();

  helpUrl?: string;
  accessibilityUrl?: string;
  privacyUrl?: string;
  imprintUrl?: string;

  constructor(
    private authenticationService: AuthenticationService,
    private consentService: ConsentService
  ) {}

  ngOnInit(): void {
    this.helpUrl = this.uiConfig.links?.help?.url;
    this.accessibilityUrl = this.uiConfig.links?.accessibility?.url;
    this.privacyUrl = this.uiConfig.links?.privacy?.url;
    this.imprintUrl = this.uiConfig.links?.imprint?.url;
  }

  isAdminRole(): boolean {
    return !!this.auth && this.authenticationService.hasAdminRole(this.auth);
  }

  sendClickedEvent(): void {
    this.inAppLinkClicked.emit();
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }
}
