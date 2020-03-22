import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
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
  styleUrls: ['./yes-no-dialog.component.scss']
})
export class YesNoDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    data.section = data.section + '.';
  }

  closeDialog(action: string): void {
    this.dialogRef.close(action);
  }

}
