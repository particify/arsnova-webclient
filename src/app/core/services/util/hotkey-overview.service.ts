import { DOCUMENT, Injectable, inject } from '@angular/core';
import { MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { HotkeysComponent } from '@app/core/components/_dialogs/hotkeys/hotkeys.component';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  HELP_KEY,
  HotkeyService,
} from '@app/core/services/util/hotkey.service';

/**
 * Opens the hotkey overview on the help key. Kept out of HotkeyService because the dialogs
 * DialogService imports use hotkeys themselves, which would make their imports circular.
 */
@Injectable({
  providedIn: 'root',
})
export class HotkeyOverviewService {
  private hotkeyService = inject(HotkeyService);
  private dialogService = inject(DialogService);
  private document = inject(DOCUMENT);

  private dialogRef?: MatDialogRef<HotkeysComponent>;

  init() {
    this.hotkeyService.registerHotkey({
      key: HELP_KEY,
      action: () => this.showDialog(),
      actionTitle: 'hotkeys.display-overview',
    });
  }

  private showDialog() {
    if (this.dialogRef?.getState() === MatDialogState.OPEN) {
      return;
    }
    // Remove focus to avoid screenreaders to announce the active element immediately after closing the dialog.
    (this.document.activeElement as HTMLElement).blur();
    this.dialogRef = this.dialogService.openDialog(HotkeysComponent, {
      data: this.hotkeyService.getHotkeyInfos(),
      width: '500px',
    });
    this.hotkeyService.setHelpOverview(this.dialogRef);
  }
}
