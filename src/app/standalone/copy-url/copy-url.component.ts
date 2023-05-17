import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ClipboardModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ],
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
      this.translateService.get('room-page.url-copied').subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
    }
  }
}
