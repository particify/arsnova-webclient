import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { YesNoDialogComponent } from '@app/shared/_dialogs/yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-start-new-round',
  templateUrl: './start-new-round.component.html',
})
export class StartNewRoundComponent {
  @Input() content: Content;
  @Input() resetEvent: Subject<string>;
  @Output() roundStarted: EventEmitter<Content> = new EventEmitter<Content>();

  constructor(
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private contentService: ContentService,
    private dialog: MatDialog
  ) {}

  showNewRoundDialog(): void {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        section: 'dialog',
        headerLabel: 'sure',
        body: 'really-start-new-round',
        confirmLabel: 'start',
        abortLabel: 'cancel',
        type: 'button-primary',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'start') {
        this.startNewRound();
      } else {
        this.translateService.get('content.canceled').subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        });
      }
    });
  }

  startNewRound() {
    const changes = { state: this.content.state };
    changes.state.round = 2;
    this.contentService
      .patchContent(this.content, changes)
      .subscribe((content) => {
        this.content.state.round = content.state.round;
        this.roundStarted.emit(this.content);
        this.translateService
          .get('content.started-new-round')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
      });
  }
}
