import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContentListComponent } from '../../../creator/content-list/content-list.component';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentCreatePageComponent } from '../../../creator/content-create-page/content-create-page.component';

@Component({
  selector: 'app-content-group-creation',
  templateUrl: './content-group-creation.component.html',
  styleUrls: ['./content-group-creation.component.scss']
})
export class ContentGroupCreationComponent implements OnInit {

  name: string;
  empty = false;

  constructor(public dialogRef: MatDialogRef<ContentListComponent>,
              public dialog: MatDialog,
              private notificationService: NotificationService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
  }

  addContentGroup() {
    if (this.name) {
      if (ContentCreatePageComponent.saveGroupInSessionStorage(this.name)) {
        this.translateService.get('content.content-group-created').subscribe(msg => {
          this.notificationService.show(msg);
          this.closeDialog(this.name);
        });
      } else {
        this.translateService.get('content.content-group-already-exists').subscribe(msg => {
          this.notificationService.show(msg);
        });
      }
    } else {
      this.empty = true;
    }
  }

  resetEmpty() {
    this.empty = false;
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
  buildGroupCreateActionCallback(): () => void {
    return () => this.addContentGroup();
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
