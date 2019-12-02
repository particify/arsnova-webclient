import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ContentListComponent } from '../../content-list/content-list.component';

@Component({
  selector: 'app-content-group-edit',
  templateUrl: './content-group-edit.component.html',
  styleUrls: ['./content-group-edit.component.scss']
})
export class ContentGroupEditComponent implements OnInit {

  name: string;

  constructor(public dialogRef: MatDialogRef<ContentListComponent>,
              public dialog: MatDialog) {}

  ngOnInit() {
  }

  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildCloseDialogActionCallback(): () => void {
    return () => this.closeDialog();
  }

  /**
   * Returns a lambda which executes the dialog dedicated action on call.
   */
  buildRoomCreateActionCallback(): () => void {
    return () => this.closeDialog(this.name);
  }

  /**
   * Closes the room create dialog on call.
   */
  closeDialog(name?: string): void {
    if (name) {
      this.dialogRef.close(name);
    } else {
      this.dialogRef.close();
    }
  }
}
