import { Component, Input } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@arsnova/app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-copy-url',
  templateUrl: './copy-url.component.html',
  styleUrls: ['./copy-url.component.scss'],
})
export class CopyUrlComponent {
  @Input() url: string;

  constructor(
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  showNotification(success: boolean): void {
    if (success) {
      this.translateService.get('dialog.url-copied').subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
    }
  }
}
