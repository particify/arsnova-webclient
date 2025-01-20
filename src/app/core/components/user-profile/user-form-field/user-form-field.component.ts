import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormField } from '@app/core/components/user-profile/user-profile.component';

@Component({
  selector: 'app-user-form-field',
  templateUrl: './user-form-field.component.html',
  standalone: false,
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
