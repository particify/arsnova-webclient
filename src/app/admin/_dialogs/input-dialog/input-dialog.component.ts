import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { UserSearchComponent } from '@app/admin/user-search/user-search.component';

export interface DialogData {
  inputName: string;
  primaryAction: string;
  useUserSearch: false;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
})
export class InputDialogComponent extends UserSearchComponent {
  input: string;

  inputName: string;
  primaryAction: string;
  useUserSearch: boolean;

  formControl = new FormControl('', [Validators.required]);
  constructor(
    private dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    protected userService: UserService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService
  ) {
    super(userService);
    this.primaryAction = data.primaryAction;
    this.inputName = data.inputName;
    this.useUserSearch = data.useUserSearch;
  }

  selectUser(searchResult: string) {
    const index = this.searchResults.indexOf(searchResult);
    this.user = this.users[index];
  }

  submit() {
    if (this.useUserSearch) {
      if (this.user) {
        this.close(this.user.id);
      } else {
        const msg = this.translateService.instant('admin-area.user-not-found');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.FAILED
        );
      }
    }
    if (this.formControl.valid) {
      this.close(this.input);
    }
  }

  close(input?: string) {
    this.dialogRef.close(input);
  }
}
