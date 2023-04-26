import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatSlideToggleModule,
    FormsModule,
    FlexModule,
  ],
  selector: 'app-settings-slide-toggle',
  templateUrl: './settings-slide-toggle.component.html',
  styleUrls: ['./settings-slide-toggle.component.scss'],
})
export class SettingsSlideToggleComponent {
  @Input() isChecked: boolean;
  @Input() label: string;
  @Input() disabled = false;
  @Output() toggleEvent = new EventEmitter<boolean>();

  toggle(event) {
    this.toggleEvent.emit(event.checked);
  }
}
