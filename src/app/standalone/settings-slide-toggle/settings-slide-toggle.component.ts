import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [
    TranslocoModule,
    MatSlideToggleModule,
    FormsModule,
    FlexModule,
    NgClass,
  ],
  selector: 'app-settings-slide-toggle',
  templateUrl: './settings-slide-toggle.component.html',
  styleUrls: ['./settings-slide-toggle.component.scss'],
})
export class SettingsSlideToggleComponent {
  @Input() isChecked = false;
  @Input({ required: true }) label!: string;
  @Input() disabled = false;
  @Output() toggleEvent = new EventEmitter<boolean>();

  toggle(event: MatSlideToggleChange) {
    this.toggleEvent.emit(event.checked);
  }
}
