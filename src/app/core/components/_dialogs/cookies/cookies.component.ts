import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ConsentGiven,
  CookieCategory,
} from '@app/core/services/util/consent.service';
import { TranslocoService } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss'],
  standalone: false,
})
export class CookiesComponent {
  private dialogRef = inject<MatDialogRef<CookiesComponent>>(MatDialogRef);
  protected route = inject(ActivatedRoute);
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  readonly dialogId = 'cookie-settings';

  categories: CookieCategory[];
  privacyUrl: string;
  inputFocus = false;

  constructor() {
    const data = inject<{
      categories: CookieCategory[];
      privacyUrl: string;
    }>(MAT_DIALOG_DATA);

    this.categories = data.categories;
    this.privacyUrl = data.privacyUrl;
  }

  acceptAllCookies() {
    this.categories
      .filter((c) => !c.disabled)
      .forEach((item) => {
        item.consent = true;
      });
    this.handleCookieSelection();
  }

  acceptSelectedCookies() {
    this.handleCookieSelection();
  }

  handleCookieSelection() {
    console.log('Accepted cookie categories: ', this.categories);
    const consentGiven: ConsentGiven = {};
    this.categories
      .filter((c) => !c.disabled)
      .forEach((c) => {
        consentGiven[c.id] = !!c.consent;
      });
    this.dialogRef.close(consentGiven);
    const msg = this.translateService.translate('cookies.settings-saved');
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
  }
}
