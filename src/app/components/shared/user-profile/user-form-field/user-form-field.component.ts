import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormField } from '../user-profile.component';

@Component({
  selector: 'app-user-form-field',
  templateUrl: './user-form-field.component.html',
  styleUrls: ['./user-form-field.component.scss'],
})
export class UserFormFieldComponent {
  @Input() formField: FormField;
  @Input() disabled = false;
  @Output() fieldUpdated: EventEmitter<FormField> =
    new EventEmitter<FormField>();

  beforeEdit: string;

  goIntoEdit() {
    this.beforeEdit = this.formField.value;
  }

  saveProfile() {
    if (this.formField.value !== this.beforeEdit) {
      this.fieldUpdated.emit(this.formField);
    }
    this.beforeEdit = null;
  }
}
