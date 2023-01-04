import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  dialogId: string;
  section: string;
  headerLabel: string;
  body: string;
  confirmLabel: string;
  abortLabel: string;
  type: string;
  bodyElement?: string;
}

@Component({
  selector: 'app-yes-no-dialog',
  templateUrl: './yes-no-dialog.component.html',
})
export class YesNoDialogComponent {
  readonly dialogId: string;

  constructor(
    public dialogRef: MatDialogRef<YesNoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    data.section = data.section + '.';
    this.dialogId = data.dialogId;
  }

  closeDialog(action: string): void {
    this.dialogRef.close(action);
  }
}
