import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

export interface ToggleButtonOption {
  id: string;
  icon: string;
  tooltip: string;
}

@Component({
  selector: 'app-toggle-button-bar',
  imports: [MatIcon, MatIconButton, MatTooltip, NgClass, FlexLayoutModule],
  templateUrl: './toggle-button-bar.component.html',
  styleUrl: './toggle-button-bar.component.scss',
})
export class ToggleButtonBarComponent {
  buttons = input.required<ToggleButtonOption[]>();
  activeButtonId = input.required<string>();
  activeButtonChange = output<string>();

  onToggle(buttonId: string) {
    if (this.activeButtonId() !== buttonId) {
      this.activeButtonChange.emit(buttonId);
    }
  }

  isActive(buttonId: string) {
    return this.activeButtonId() === buttonId;
  }
}
