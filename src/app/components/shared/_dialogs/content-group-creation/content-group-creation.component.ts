import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ContentListComponent } from '../../../creator/content-list/content-list.component';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentCreatePageComponent } from '../../../creator/content-create-page/content-create-page.component';
import { GlobalStorageService, MemoryStorageKey } from '../../../../services/util/global-storage.service';
import { ContentGroup } from '../../../../models/content-group';

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
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
  }

  addContentGroup() {
    if (this.name) {
      if (this.saveGroupInSessionStorage(this.name)) {
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

  saveGroupInSessionStorage(newGroup: string): boolean {
    if (newGroup !== '') {
      this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, new ContentGroup('', '', '', newGroup, [], true));
      const groups: string [] = this.globalStorageService.getMemoryItem(MemoryStorageKey.CONTENT_GROUPS) || [];
      if (groups) {
        for (let i = 0; i < groups.length; i++) {
          if (newGroup === groups[i]) {
            return false;
          }
        }
      }
      groups.push(newGroup);
      this.globalStorageService.setMemoryItem(MemoryStorageKey.CONTENT_GROUPS, groups);
      return true;
    }
  }
}
