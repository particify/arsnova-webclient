import { Component, Input } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@arsnova/app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-copy-room-url',
  templateUrl: './copy-room-url.component.html',
})
export class CopyRoomUrlComponent {
  @Input() url;

  constructor(
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  copyRoomUrl(): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.translateService.get('dialog.url-copied').subscribe((msg) => {
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }
}
