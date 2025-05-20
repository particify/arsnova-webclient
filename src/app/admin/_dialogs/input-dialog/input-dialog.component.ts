import { Component, EventEmitter, inject } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { UserSearchComponent } from '@app/admin/user-search/user-search.component';
import { FormService } from '@app/core/services/util/form.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FlexModule } from '@angular/flex-layout';
import { LoadingButtonComponent } from '../../../standalone/loading-button/loading-button.component';
import { MatButton } from '@angular/material/button';

export interface DialogData {
  inputName: string;
  primaryAction: string;
  useUserSearch?: boolean;
  input: string;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  imports: [
    FormsModule,
    CdkScrollable,
    MatDialogContent,
    SearchBarComponent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FlexModule,
    MatDialogActions,
    LoadingButtonComponent,
    MatButton,
    TranslocoPipe,
  ],
})
export class InputDialogComponent extends UserSearchComponent {
  private dialogRef = inject<MatDialogRef<InputDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  protected translateService = inject(TranslocoService);
  protected notificationService = inject(NotificationService);
  private formService = inject(FormService);

  clicked$ = new EventEmitter<string>();

  input?: string;

  inputName: string;
  primaryAction: string;
  useUserSearch: boolean;

  formControl = new FormControl('', [Validators.required]);
  constructor() {
    super();
    const data = this.data;
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
