import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/util/notification.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Room } from '../../../models/room';
import { ThemeService } from '../../../../theme/theme.service';
import { DialogService } from '../../../services/util/dialog.service';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { GlobalStorageService } from '../../../services/util/global-storage.service';
import { ConsentService } from '../../../services/util/consent.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public room: Room;

  privacyUrl: string;
  imprintUrl: string;

  constructor(
    public notificationService: NotificationService,
    public router: Router,
    private translateService: TranslateService,
    private langService: LanguageService,
    public authenticationService: AuthenticationService,
    private themeService: ThemeService,
    private dialogService: DialogService,
    private apiConfigService: ApiConfigService,
    private globalStorageService: GlobalStorageService,
    private consentService: ConsentService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    if (this.consentService.consentRequired()) {
      this.consentService.openDialog();
    }

    this.apiConfigService.getApiConfig$().subscribe(config => {
      this.privacyUrl = config.ui.links.privacy.url;
      this.imprintUrl = config.ui.links.imrpint.url ;
    });
  }

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
  }

  showImprint() {
    this.openUrlInNewTab(this.imprintUrl);
  }

  showDataProtection() {
    this.openUrlInNewTab(this.privacyUrl);
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }
}
