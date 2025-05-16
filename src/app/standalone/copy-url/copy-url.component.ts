import { Component, Input, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';

@Component({
  imports: [
    TranslocoModule,
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
  private translateService = inject(TranslocoService);
  private notificationService = inject(NotificationService);

  @Input({ required: true }) url!: string;

  showNotification(success: boolean): void {
    if (success) {
      this.translateService
        .selectTranslate('room-page.url-copied')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        });
    }
  }
}
