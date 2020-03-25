import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../components/shared/_dialogs/yes-no-dialog/yes-no-dialog.component';
import { InfoDialogComponent } from '../../components/shared/_dialogs/info-dialog/info-dialog.component';

@Injectable()
export class DialogService {

  constructor(public dialog: MatDialog) {
  }

  openDeleteDialog(body: string, bodyElement?: string): MatDialogRef<YesNoDialogComponent> {
    return this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        section: 'dialog',
        headerLabel: 'sure',
        body: body,
        confirmLabel: 'delete',
        abortLabel: 'cancel',
        type: 'button-warn',
        bodyElement: bodyElement,
      }
    });
  }

  openInfoDialog(section: string, body: string): void {
    this.dialog.open(InfoDialogComponent, {
      'width': '80%',
      data: {
        section: section,
        body: body
      }
    });
  }
}
