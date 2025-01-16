import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  templateUrl: './form-header.component.html',
  styleUrls: ['./form-header.component.scss'],
  standalone: false,
})
export class FormHeaderComponent {
  @Input({ required: true }) text!: string;
}
