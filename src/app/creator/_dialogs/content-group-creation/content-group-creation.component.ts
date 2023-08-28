import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { GroupContentComponent } from '@app/creator/content-list/group-content/group-content.component';
import { ContentGroup } from '@app/core/models/content-group';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

interface DialogData {
  roomId?: string;
}

@Component({
  selector: 'app-content-group-creation',
  templateUrl: './content-group-creation.component.html',
})
export class ContentGroupCreationComponent extends FormComponent {
  readonly dialogId = 'create-content-group';

  @ViewChild('nameInput') nameInput: ElementRef;

  name = '';

  constructor(
    public dialogRef: MatDialogRef<GroupContentComponent>,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private contentGroupService: ContentGroupService,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    protected formService: FormService
  ) {
    super(formService);
  }

  addContentGroup() {
    if (this.name) {
      if (this.contentGroupService.saveGroupInMemoryStorage(this.name)) {
        if (!this.data.roomId) {
          this.closeDialog(this.name);
          return;
        }
        const newGroup = new ContentGroup();
        newGroup.roomId = this.data.roomId;
        newGroup.name = this.name;
        this.disableForm();
        this.contentGroupService.post(newGroup).subscribe(
          () => {
            this.translateService
              .get('room-page.content-group-created')
              .subscribe((msg) => {
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
            this.closeDialog(this.name);
          },
          () => {
            this.enableForm();
          }
        );
      } else {
        this.translateService
          .get('content.duplicate-series-name')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.FAILED
            );
          });
      }
    } else {
      this.translateService.get('dialog.please-enter-name').subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        this.nameInput.nativeElement.focus();
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
