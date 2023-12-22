import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.scss'],
})
export class AdminPageHeaderComponent {
  @Input({ required: true }) headerText!: string;
  @Input() buttonText?: string;
  @Input() buttonIcon?: string;
  @Output() buttonClicked = new EventEmitter<void>();

  click() {
    this.buttonClicked.emit();
  }
}
