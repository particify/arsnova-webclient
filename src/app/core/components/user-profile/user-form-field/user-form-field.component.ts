import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormField } from '@app/core/components/user-profile/user-profile.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-user-form-field',
  templateUrl: './user-form-field.component.html',
  imports: [
    MatFormField,
    FlexModule,
    MatLabel,
    MatInput,
    FormsModule,
    TranslocoPipe,
  ],
})
export class UserFormFieldComponent {
  @Input({ required: true }) formField!: FormField;
  @Input() disabled = false;
  @Output() fieldUpdated: EventEmitter<FormField> =
    new EventEmitter<FormField>();

  beforeEdit?: string;

  goIntoEdit() {
    this.beforeEdit = this.formField.value;
  }

  saveProfile() {
    if (this.formField.value !== this.beforeEdit) {
      this.fieldUpdated.emit(this.formField);
    }
    this.beforeEdit = undefined;
  }
}
