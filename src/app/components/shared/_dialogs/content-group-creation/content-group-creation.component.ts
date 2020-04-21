import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContentListComponent } from '../../../creator/content-list/content-list.component';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentGroupService } from '../../../../services/http/content-group.service';

@Component({
  selector: 'app-content-group-creation',
  templateUrl: './content-group-creation.component.html',
  styleUrls: ['./content-group-creation.component.scss']
})
export class ContentGroupCreationComponent implements OnInit {

  name = '';

  constructor(
    public dialogRef: MatDialogRef<ContentListComponent>,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private contentGroupService: ContentGroupService
  ) {
  }

  ngOnInit() {
  }

  addContentGroup() {
    if (this.name) {
      if (this.contentGroupService.saveGroupInMemoryStorage(this.name)) {
        this.translateService.get('dialog.content-group-created').subscribe(msg => {
          this.notificationService.show(msg);
          this.closeDialog(this.name);
        });
      } else {
        this.translateService.get('dialog.content-group-already-exists').subscribe(msg => {
          this.notificationService.show(msg);
        });
      }
    } else {
      this.translateService.get('dialog.please-enter-name').subscribe(msg => {
        this.notificationService.show(msg);
        document.getElementById('name-input').focus();
      });
    }
  }

  closeDialog(name?: string): void {
    if (name) {
      this.dialogRef.close(name);
    } else {
      this.dialogRef.close();
    }
  }
}
