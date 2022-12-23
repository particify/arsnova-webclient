import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DialogConfirmActionButtonType } from '../../../shared/dialog/dialog-action-buttons/dialog-action-buttons.component';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
})
export class OverlayComponent {
  confirmButtonType: DialogConfirmActionButtonType;

  constructor(private dialogRef: MatDialogRef<OverlayComponent>) {
    this.confirmButtonType = DialogConfirmActionButtonType.Primary;
  }

  showCookieModal() {
    this.dialogRef.close(true);
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildDeclineActionCallback(): () => void {
    return () => {
      this.showCookieModal();
    };
  }
}
