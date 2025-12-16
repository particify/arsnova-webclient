import {
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
} from '@angular/core';
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
import { FormService } from '@app/core/services/util/form.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ExtendedModule, FlexModule } from '@angular/flex-layout';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { DisableFormDirective } from '@app/core/directives/disable-form.directive';
import { NgClass } from '@angular/common';
import { AdminUser, AdminUsersGql } from '@gql/generated/graphql';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, filter, map, of } from 'rxjs';

export interface DialogData {
  inputName: string;
  primaryAction: string;
  useUserSearch?: boolean;
  input: string;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.scss',
  imports: [
    FormsModule,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FlexModule,
    MatDialogActions,
    LoadingButtonComponent,
    MatButton,
    TranslocoPipe,
    MatIcon,
    MatAutocompleteTrigger,
    DisableFormDirective,
    MatPrefix,
    NgClass,
    ExtendedModule,
    MatIconButton,
    MatSuffix,
    MatAutocomplete,
    MatOption,
  ],
})
export class InputDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<InputDialogComponent>>(MatDialogRef);
  private readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly formService = inject(FormService);
  private readonly usersQuery = inject(AdminUsersGql);
  private readonly destroyRef = inject(DestroyRef);

  clicked$ = new EventEmitter<string>();

  inputName: string;
  primaryAction: string;
  useUserSearch: boolean;

  formControl = new FormControl<string | AdminUser | undefined>(undefined, [
    Validators.required,
  ]);
  constructor() {
    const data = this.data;
    this.primaryAction = data.primaryAction;
    this.inputName = data.inputName;
    this.useUserSearch = data.useUserSearch || false;
    this.formControl.setValue(data.input);
    if (this.useUserSearch) {
      this.formControl.valueChanges
        .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          if (typeof value === 'string') {
            this.search(value ?? undefined);
          }
        });
    }
  }

  private usersQueryRef = this.usersQuery.watch({
    variables: { exactSearchMode: true },
    errorPolicy: 'all',
  });
  private usersResult = toSignal(
    this.usersQueryRef.valueChanges.pipe(
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.adminUsers),
      catchError(() => of())
    )
  );
  users = computed(
    () =>
      this.usersResult()
        ?.edges?.filter((e) => !!e)
        .map((e) => e.node) ?? []
  );

  user?: AdminUser;

  clear() {
    this.formControl.setValue('');
  }

  search(search?: string) {
    if (search !== this.usersQueryRef.options.variables.search) {
      this.usersQueryRef.options.variables.search = search;
      this.usersQueryRef.refetch();
      this.user = undefined;
    }
  }

  selectUser(user: AdminUser) {
    this.user = user;
  }

  submit() {
    if (this.useUserSearch) {
      if (this.user) {
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
    } else {
      if (this.formControl.valid) {
        this.formService.disableForm();
        if (typeof this.formControl.value === 'string')
          this.clicked$.emit(this.formControl.value);
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
