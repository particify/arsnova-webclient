import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { UiConfig } from '@app/core/models/api-config';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ConsentService } from '@app/core/services/util/consent.service';

@Component({
  selector: 'app-footer-links',
  imports: [CoreModule, RouterModule],
  templateUrl: './footer-links.component.html',
  styleUrl: './footer-links.component.scss',
})
export class FooterLinksComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private consentService = inject(ConsentService);

  @Input({ required: true }) uiConfig!: UiConfig;
  @Input() showHelp = false;
  @Input() showJoinLink = false;
  @Output() inAppLinkClicked = new EventEmitter<void>();

  helpUrl?: string;
  accessibilityUrl?: string;
  privacyUrl?: string;
  imprintUrl?: string;

  ngOnInit(): void {
    this.helpUrl = this.uiConfig.links?.help?.url;
    this.accessibilityUrl = this.uiConfig.links?.accessibility?.url;
    this.privacyUrl = this.uiConfig.links?.privacy?.url;
    this.imprintUrl = this.uiConfig.links?.imprint?.url;
  }

  isAdminRole(): boolean {
    return this.authenticationService.hasAdminRole();
  }

  sendClickedEvent(): void {
    this.inAppLinkClicked.emit();
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }
}
