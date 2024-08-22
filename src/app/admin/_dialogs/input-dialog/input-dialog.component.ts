import { Component, EventEmitter, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { UserSearchComponent } from '@app/admin/user-search/user-search.component';
import { FormService } from '@app/core/services/util/form.service';
import { AdminService } from '@app/core/services/http/admin.service';

export interface DialogData {
  inputName: string;
  primaryAction: string;
  useUserSearch?: boolean;
  input: string;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
})
export class InputDialogComponent extends UserSearchComponent {
  clicked$ = new EventEmitter<string>();

  input?: string;

  inputName: string;
  primaryAction: string;
  useUserSearch: boolean;

  formControl = new FormControl('', [Validators.required]);
  constructor(
    private dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    protected userService: UserService,
    protected translateService: TranslocoService,
    protected notificationService: NotificationService,
    protected adminService: AdminService,
    private formService: FormService
  ) {
    super(userService, adminService);
    this.primaryAction = data.primaryAction;
    this.inputName = data.inputName;
    this.useUserSearch = data.useUserSearch || false;
    this.input = data.input;
  }

  selectUser(searchResult: string) {
    const index = this.searchResults.indexOf(searchResult);
    this.user = this.users[index];
  }

  submit() {
    if (this.useUserSearch) {
      if (this.user) {
        this.formService.disableForm();
        this.clicked$.emit(this.user.id);
      } else {
        const msg = this.translateService.translate(
          'admin.admin-area.user-not-found'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.FAILED
        );
      }
    }
    if (this.formControl.valid) {
      this.formService.disableForm();
      this.clicked$.emit(this.input);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
