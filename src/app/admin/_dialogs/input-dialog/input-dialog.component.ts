import { Component, EventEmitter, inject } from '@angular/core';
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
  standalone: false,
})
export class InputDialogComponent extends UserSearchComponent {
  private dialogRef = inject<MatDialogRef<InputDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  protected userService: UserService;
  protected translateService = inject(TranslocoService);
  protected notificationService = inject(NotificationService);
  protected adminService: AdminService;
  private formService = inject(FormService);

  clicked$ = new EventEmitter<string>();

  input?: string;

  inputName: string;
  primaryAction: string;
  useUserSearch: boolean;

  formControl = new FormControl('', [Validators.required]);
  constructor() {
    const userService = inject(UserService);
    const adminService = inject(AdminService);

    super(userService, adminService);
    const data = this.data;
    this.userService = userService;
    this.adminService = adminService;

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
