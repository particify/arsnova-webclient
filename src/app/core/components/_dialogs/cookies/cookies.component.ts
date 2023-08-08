import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ConsentGiven,
  CookieCategory,
} from '@app/core/services/util/consent.service';
import { TranslateService } from '@ngx-translate/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss'],
})
export class CookiesComponent {
  readonly dialogId = 'cookie-settings';

  categories: CookieCategory[];
  privacyUrl: string;
  inputFocus: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: { categories: CookieCategory[]; privacyUrl: string },
    private dialogRef: MatDialogRef<CookiesComponent>,
    protected route: ActivatedRoute,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {
    this.categories = data.categories;
    this.privacyUrl = data.privacyUrl;
  }

  acceptAllCookies() {
    this.categories.forEach((item) => {
      item.consent = true;
    });
    this.handleCookieSelection();
  }

  acceptSelectedCookies() {
    this.handleCookieSelection();
  }

  handleCookieSelection() {
    console.log('Accepted cookie categories: ', this.categories);
    const consentGiven: ConsentGiven = this.categories.reduce((map, item) => {
      map[item.id] = item.consent;
      return map;
    }, {});
    this.dialogRef.close(consentGiven);
    const msg = this.translateService.instant('cookies.settings-saved');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
  }
}
