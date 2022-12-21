import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-slide-toggle',
  templateUrl: './settings-slide-toggle.component.html',
  styleUrls: ['./settings-slide-toggle.component.scss'],
})
export class SettingsSlideToggleComponent {
  @Input() isChecked: boolean;
  @Input() label: string;
  @Output() toggleEvent = new EventEmitter<boolean>();

  toggle(event) {
    this.toggleEvent.emit(event.checked);
  }
}
