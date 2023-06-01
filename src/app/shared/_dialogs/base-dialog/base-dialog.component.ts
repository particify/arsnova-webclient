import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface DialogData {
  dialogId: string;
  section: string;
  headerLabel: string;
  body: string;
  confirmLabel: string;
  abortLabel?: string;
  type: string;
  bodyElement?: string;
}

@Component({
  selector: 'app-base-dialog',
  templateUrl: './base-dialog.component.html',
})
export class BaseDialogComponent {
  readonly dialogId: string;

  constructor(
    public dialogRef: MatDialogRef<BaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    data.section = data.section + '.';
    this.dialogId = data.dialogId;
  }

  closeDialog(action: string): void {
    this.dialogRef.close(action);
  }
}
